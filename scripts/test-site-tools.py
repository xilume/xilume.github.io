#!/usr/bin/env python3
"""Regression tests for publication safety, failure detection and UTF-8 sync.

All writes use temporary siblings of the repository; website sources stay intact.
Run with: python scripts/test-site-tools.py
"""
import contextlib
import importlib.util
import io
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
