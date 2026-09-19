#!/usr/bin/env python3
"""Regression tests for publication safety, failure detection and UTF-8 sync.

All writes use temporary siblings of the repository; website sources stay intact.
Run with: python scripts/test-site-tools.py
"""
import contextlib
from decimal import Decimal
import importlib.util
import io
import json
import locale
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from site_files import ROOT_FILES, SITE_DIRS

ROOT = Path(__file__).resolve().parents[1]


def load(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), ROOT / "scripts" / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load("build-site")
checker = load("check-site")


class PublicationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix=".xilume-tool-tests-", dir=ROOT.parent)
        cls.scratch = Path(cls.temporary.name).resolve()
        cls.site = cls.scratch / "published"
        with contextlib.redirect_stdout(io.StringIO()):
            builder.build(cls.site)

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    def test_current_site_passes(self):
        errors, _ = checker.check(self.site)
        self.assertEqual(errors, [])

    def test_product_snippet_missing_inputs_are_detected(self):
        for kind in ("Product", ["Product"], "https://schema.org/Product"):
            for empty in ({}, {"offers": {}}, {"offers": [], "review": None}):
                with self.subTest(kind=kind, empty=empty):
                    product = {"@type": kind, "name": "Fixture", **empty}
                    self.assertTrue(checker.product_snippet_errors({"@graph": [product]}))
        self.assertEqual(checker.product_snippet_errors({"@type": "WebPage", "name": "Inquiry"}), [])
        self.assertTrue(checker.product_snippet_errors({"@type": "Product", "review": {"@type": "Review"}}))

    def test_product_offer_price_and_currency(self):
        product = {"@type": "Product", "name": "Fixture"}
        for price in ("69.99", "199.00", 0, 69.99):
            offer = {"@type": "Offer", "price": price, "priceCurrency": "USD"}
            self.assertEqual(checker.product_snippet_errors({**product, "offers": offer}), [])
        for price in (None, "", "Request pricing", "US$199", "NaN", -1, True):
            with self.subTest(price=price):
                offer = {"@type": "Offer", "price": price, "priceCurrency": "USD"}
                self.assertTrue(checker.product_snippet_errors({**product, "offers": [offer]}))
        self.assertTrue(checker.product_snippet_errors({**product, "offers": {"price": "199"}}))
        self.assertTrue(checker.product_snippet_errors({**product, "offers": "Request pricing"}))
        specification = {"@type": "Offer", "priceSpecification": {"price": 199, "priceCurrency": "USD"}}
        self.assertEqual(checker.product_snippet_errors({**product, "offers": specification}), [])
        aggregate = {"@type": "AggregateOffer", "lowPrice": "199", "priceCurrency": "USD"}
        self.assertEqual(checker.product_snippet_errors({**product, "offers": aggregate}), [])
        for key in ("review", "aggregateRating"):
            self.assertEqual(checker.product_snippet_errors({**product, key: {"@type": "Fixture"}}), [])

    def test_public_prices_match_product_offers_in_both_languages(self):
        for prefix in ("", "zh-cn/"):
            for slug in ("8hub", "mini-pcie-dual-can-fd"):
                path = self.site / f"{prefix}products/{slug}/index.html"
                with self.subTest(path=path.relative_to(self.site)):
                    source = path.read_text(encoding="utf-8")
                    page = checker.Page(path, source)
                    products = [node for block in page.json_blocks
                                for node in checker.json_nodes(json.loads(block))
                                if checker.has_schema_type(node, "Product")]
                    self.assertEqual(len(products), 1)
                    offer = products[0]["offers"]
                    visible = re.search(r'class="product-commerce-price"[^>]*>(.*?)</div>', source, re.S).group(1)
                    visible = re.sub(r"<[^>]+>", "", visible).strip()
                    self.assertTrue(visible.startswith("US$"))
                    self.assertEqual(offer["priceCurrency"], "USD")
                    self.assertEqual(Decimal(offer["price"]), Decimal(visible[3:]))
                    self.assertEqual(offer["url"], page.canonicals[0])

    def test_inquiry_pages_use_webpage_and_keep_breadcrumbs(self):
        for prefix in ("", "zh-cn/"):
            path = self.site / f"{prefix}products/8hub-embedded/index.html"
            page = checker.Page(path, path.read_text(encoding="utf-8"))
            nodes = [node for block in page.json_blocks
                     for node in checker.json_nodes(json.loads(block))]
            self.assertFalse(any(checker.has_schema_type(node, "Product") for node in nodes))
            webpages = [node for node in nodes if checker.has_schema_type(node, "WebPage")]
            breadcrumbs = [node for node in nodes if checker.has_schema_type(node, "BreadcrumbList")]
            self.assertEqual(len(webpages), 1)
            self.assertEqual(len(breadcrumbs), 1)
            self.assertEqual(webpages[0]["url"], page.canonicals[0])
            self.assertEqual(webpages[0]["breadcrumb"]["@id"], breadcrumbs[0]["@id"])
            self.assertEqual(len(breadcrumbs[0]["itemListElement"]), 4)

    def test_missing_file_is_detected(self):
        path = self.site / "styles.css"
        original = path.read_bytes()
        try:
            path.unlink()
            errors, _ = checker.check(self.site)
            self.assertTrue(any("missing local target" in error and "styles.css" in error for error in errors))
        finally:
            path.write_bytes(original)

    def test_broken_link_and_anchor_are_detected(self):
        path = self.site / "index.html"
        original = path.read_bytes()
        try:
            path.write_text(original.decode("utf-8") + '<a href="/missing-page/">Test</a><a href="/#missing-anchor">Test</a>', encoding="utf-8")
            errors, _ = checker.check(self.site)
            self.assertTrue(any("missing local target /missing-page/" in error for error in errors))
            self.assertTrue(any("missing anchor /#missing-anchor" in error for error in errors))
        finally:
            path.write_bytes(original)

    def test_robots_policy_and_unexpected_file_are_detected(self):
        page = self.site / "index.html"
        original = page.read_bytes()
        unexpected = self.site / "AGENTS.md"
        try:
            page.write_text(original.decode("utf-8").replace("max-image-preview:none", "max-image-preview:large"), encoding="utf-8")
            unexpected.write_text("local maintenance fixture", encoding="utf-8")
            errors, _ = checker.check(self.site)
            self.assertTrue(any("preserve index, follow" in error for error in errors))
            self.assertTrue(any("AGENTS.md: outside" in error for error in errors))
        finally:
            page.write_bytes(original)
            unexpected.unlink()

    def test_builder_excludes_nested_maintenance_and_guards_output(self):
        source = self.scratch / "source-fixture"
        source.mkdir()
        for name in ROOT_FILES:
            (source / name).write_text("fixture", encoding="utf-8")
        for name in SITE_DIRS:
            (source / name).mkdir()
        keep = source / "products" / "public.html"
        keep.write_text("public fixture", encoding="utf-8")
        forbidden = ("AGENTS.md", "README.md", "docs/status.md", "scripts/local.py",
                     "products/AGENTS.md", "products/docs/status.md",
                     "products/Xilume_Website_Codex_Handoff/private.txt", "images/.env")
        for name in forbidden:
            path = source / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("maintenance fixture", encoding="utf-8")
        output = source / "_site"
        with patch.object(builder, "ROOT", source), contextlib.redirect_stdout(io.StringIO()):
            builder.build(output)
            self.assertTrue((output / "products/public.html").is_file())
            for name in forbidden:
                self.assertFalse((output / name).exists(), name)
            for unsafe in (source, source.parent, source / "products", self.site):
                with self.assertRaises(ValueError):
                    builder.build(unsafe)
            sentinel = output / "stale.html"
            sentinel.write_text("stale fixture", encoding="utf-8")
            builder.build(output)
            self.assertFalse(sentinel.exists())
            (source / "site.js").unlink()
            with self.assertRaisesRegex(ValueError, "complete the checkout"):
                builder.build(output)
            self.assertTrue((output / "site.js").exists(), "failed preflight must preserve the previous build")

    def test_sync_utf8_write_idempotence_and_protected_robots(self):
        source = self.scratch / "sync-fixture"
        (source / "scripts").mkdir(parents=True)
        shutil.copy2(ROOT / "scripts/sync-site-chrome.py", source / "scripts/sync-site-chrome.py")
        for page in self.site.rglob("*.html"):
            destination = source / page.relative_to(self.site)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(page, destination)
        protected = ("index.html", "about/index.html", "zh-cn/index.html", "zh-cn/about/index.html")
        robots = {name: re.search(r'<meta name="robots"[^>]*>', (source / name).read_text(encoding="utf-8")).group() for name in protected}
        changed_page = source / "zh-cn/index.html"
        changed_page.write_text(changed_page.read_text(encoding="utf-8").replace('aria-label="熙联迈首页"', 'aria-label="Test old label"'), encoding="utf-8")
        skipped = source / "_site/index.html"
        skipped.parent.mkdir()
        skipped.write_bytes(changed_page.read_bytes())
        skipped_before = skipped.read_bytes()
        env = dict(os.environ, PYTHONUTF8="0")
        command = [sys.executable, "-X", "utf8=0", str(source / "scripts/sync-site-chrome.py")]
        first = subprocess.run(command, env=env, capture_output=True)
        self.assertEqual(first.returncode, 0, first.stderr)
        self.assertIn('aria-label="熙联迈首页"', changed_page.read_text(encoding="utf-8"))
        self.assertNotIn("Test old label", changed_page.read_text(encoding="utf-8"))
        after = {page.relative_to(source).as_posix(): page.read_bytes() for page in source.rglob("*.html")}
        second = subprocess.run(command, env=env, capture_output=True)
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertIn(b"Synchronized 0 pages", second.stdout)
        self.assertEqual(after, {page.relative_to(source).as_posix(): page.read_bytes() for page in source.rglob("*.html")})
        self.assertEqual(skipped.read_bytes(), skipped_before)
        for name in protected:
            self.assertIn(robots[name], (source / name).read_text(encoding="utf-8"))


if __name__ == "__main__":
    print(f"Python {sys.version.split()[0]}; locale encoding {locale.getencoding()}; sync subprocess forces utf8_mode=0")
    unittest.main(verbosity=2)
