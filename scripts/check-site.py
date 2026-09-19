#!/usr/bin/env python3
"""Check the built Xilume artifact, using only the Python standard library.

Checks local HTML/CSS references, literal JS links, IDs, JSON-LD syntax and
Product snippet essentials, manifest resources, the sitemap and bilingual SEO
links. Does not execute JS, contact external sites, or validate product facts,
full Google rich-result eligibility, downloads or visual layout.
Usage: python scripts/check-site.py [PATH_TO_SITE]
"""
import argparse
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET

from site_files import ROOT_FILES, SITE_DIRS, published

ORIGIN = "https://xilume.co"
CSS_URL = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)
CSS_IMPORT = re.compile(r"@import\s+['\"]([^'\"]+)['\"]", re.I)


class Page(HTMLParser):
    def __init__(self, path, source):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.references = []
        self.ids = set()
        self.canonicals = []
        self.alternates = {}
        self.robots = ""
        self.lang = ""
        self.normal = False
        self.json_blocks = []
        self.json_text = None
        self.style_text = None
        self.feed(source)

    def reference(self, value):
        self.references.append((value, self.getpos()[0]))

    def css(self, source):
        for match in CSS_URL.finditer(source):
            self.reference(match.group(2))
        for match in CSS_IMPORT.finditer(source):
            self.reference(match.group(1))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "a" and attrs.get("name"):
            self.ids.add(attrs["name"])
        if tag == "html":
            self.lang = attrs.get("lang", "").lower()
        if tag == "header" and "site-header" in attrs.get("class", "").split():
            self.normal = True
        for attr in ("href", "src", "poster", "data-src"):
            if attrs.get(attr):
                self.reference(attrs[attr])
        if attrs.get("srcset") and not attrs["srcset"].startswith("data:"):
            for candidate in attrs["srcset"].split(","):
                if candidate.strip():
                    self.reference(candidate.strip().split()[0])
        if attrs.get("style"):
            self.css(attrs["style"])
        if tag == "link":
            relations = attrs.get("rel", "").lower().split()
            if "canonical" in relations:
                self.canonicals.append(attrs.get("href", ""))
            if "alternate" in relations and "hreflang" in attrs:
                self.alternates[attrs["hreflang"].lower()] = attrs.get("href", "")
        if tag == "meta":
            if attrs.get("name", "").lower() == "robots":
                self.robots = attrs.get("content", "").lower()
            if attrs.get("property", "").lower() in {"og:image", "og:url"} or attrs.get("name") == "twitter:image":
                self.reference(attrs.get("content", ""))
            if attrs.get("http-equiv", "").lower() == "refresh":
                match = re.search(r"url\s*=\s*(.*)", attrs.get("content", ""), re.I)
                if match:
                    self.reference(match.group(1).strip(" '\""))
        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self.json_text = ""
        if tag == "style":
            self.style_text = ""

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data):
        if self.json_text is not None:
            self.json_text += data
        if self.style_text is not None:
            self.style_text += data

    def handle_endtag(self, tag):
        if tag == "script" and self.json_text is not None:
            self.json_blocks.append(self.json_text)
            self.json_text = None
        if tag == "style" and self.style_text is not None:
            self.css(self.style_text)
            self.style_text = None


def route(path):
    value = "/" + path.as_posix()
    return value[:-10] if value.endswith("index.html") else value


def json_nodes(value):
    """Include nested JSON-LD nodes, @graph entries and top-level arrays."""
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from json_nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from json_nodes(child)


def has_schema_type(node, expected):
    types = node.get("@type", [])
    if isinstance(types, str):
        types = [types]
    return isinstance(types, list) and any(
        value in {expected, f"https://schema.org/{expected}", f"http://schema.org/{expected}"}
        for value in types if isinstance(value, str)
    )


def product_snippet_errors(value):
    """Catch missing snippet inputs, not a substitute for Google's test.

    Inquiry-only pages should use WebPage/BreadcrumbList until real public
    offer or review data is available. Never synthesize prices or ratings.
    """
    errors = []
    for node in json_nodes(value):
        if not has_schema_type(node, "Product"):
            continue
        if not isinstance(node.get("name"), str) or not node["name"].strip():
            errors.append("Product requires a nonempty name")
        if not any(node.get(key) for key in ("offers", "review", "aggregateRating")):
            errors.append("Product requires offers, review or aggregateRating for product snippets")
        offers = node.get("offers", [])
        for offer in offers if isinstance(offers, list) else [offers]:
            if not isinstance(offer, dict):
                errors.append("Product offers must be an Offer or AggregateOffer object")
                continue
            specification = offer.get("priceSpecification", {})
            if not isinstance(specification, dict):
                specification = {}
            field = "lowPrice" if has_schema_type(offer, "AggregateOffer") else "price"
            price = offer.get(field, specification.get("price"))
            if isinstance(price, bool) or not re.fullmatch(r"\d+(?:\.\d+)?", str(price)):
                errors.append(f"Product offer requires a nonnegative numeric {field}")
            currency = offer.get("priceCurrency", specification.get("priceCurrency", ""))
            if not isinstance(currency, str) or not re.fullmatch(r"[A-Z]{3}", currency):
                errors.append("Product offer requires a three-letter priceCurrency")
    return errors


def check(root):
    errors = []
    references = 0
    pages = {}
    files = set()
    if not root.is_dir():
        return [f"Site directory does not exist: {root}"], ""
    for path in root.rglob("*"):
        relative = PurePosixPath(path.relative_to(root).as_posix())
        if path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction()):
            errors.append(f"{relative}: symbolic links/junctions are not allowed")
            continue
        if not published(relative):
            errors.append(f"{relative}: outside the publication allowlist")
        if path.is_file():
            files.add(relative.as_posix())
            if path.suffix.lower() == ".html":
                pages[relative.as_posix()] = Page(relative, path.read_text(encoding="utf-8"))
    for name in ROOT_FILES:
        if name not in files:
            errors.append(f"{name}: required publication file is missing")
    for name in SITE_DIRS:
        if not (root / name).is_dir():
            errors.append(f"{name}/: required publication directory is missing")

    def reference(source, url, line=1):
        nonlocal references
        value = unescape(url.strip())
        if not value or value == "#" or "${" in value:
            return
        resolved = urlsplit(urljoin(ORIGIN + route(PurePosixPath(source)), value))
        if resolved.scheme not in {"http", "https"} or resolved.netloc != "xilume.co":
            return
        references += 1
        relative = unquote(resolved.path).lstrip("/")
        if resolved.path.endswith("/"):
            relative += "index.html"
        # Compare POSIX spelling, even on Windows, so case-only path mistakes fail.
        if relative not in files:
            errors.append(f"{source}:{line}: missing local target {value}")
        elif resolved.fragment and relative in pages:
            anchor = unquote(resolved.fragment)
            if anchor not in pages[relative].ids:
                errors.append(f"{source}:{line}: missing anchor {value}")

    for name, page in pages.items():
        for value, line in page.references:
            reference(name, value, line)
        for block in page.json_blocks:
            try:
                data = json.loads(block)
            except json.JSONDecodeError as error:
                errors.append(f"{name}: invalid JSON-LD: {error}")
            else:
                errors.extend(f"{name}: {error}" for error in product_snippet_errors(data))
    for name in sorted(files):
        suffix = PurePosixPath(name).suffix.lower()
        if suffix not in {".css", ".js"}:
            continue
        source = (root / name).read_text(encoding="utf-8")
        if suffix == ".css":
            for match in CSS_URL.finditer(source):
                reference(name, match.group(2), source.count("\n", 0, match.start()) + 1)
            for match in CSS_IMPORT.finditer(source):
                reference(name, match.group(1), source.count("\n", 0, match.start()) + 1)
        else:
            # Current scripts have literal HTML href/src attributes. Interpolated
            # links need browser tests and are deliberately not guessed here.
            for match in re.finditer(r"(?:href|src)\s*=\s*['\"]([^'\"]+)['\"]", source):
                reference(name, match.group(1), source.count("\n", 0, match.start()) + 1)
            if name == "finder.js":
                # Finder resolves these catalog paths against either locale root.
                for match in re.finditer(r'"href"\s*:\s*"([^"$]+)"', source):
                    for prefix in ("/", "/zh-cn/"):
                        reference(name, prefix + match.group(1))

    if "CNAME" in files and (root / "CNAME").read_text(encoding="utf-8").strip() != "xilume.co":
        errors.append("CNAME: expected xilume.co")
    if "site.webmanifest" in files:
        manifest = json.loads((root / "site.webmanifest").read_text(encoding="utf-8"))
        reference("site.webmanifest", manifest.get("start_url", ""))
        for icon in manifest.get("icons", []):
            reference("site.webmanifest", icon.get("src", ""))
    protected = ("index.html", "about/index.html", "zh-cn/index.html", "zh-cn/about/index.html")
    for name in protected:
        page = pages.get(name)
        tokens = {token.strip() for token in page.robots.split(",")} if page else set()
        if tokens != {"index", "follow", "max-image-preview:none"}:
            errors.append(f"{name}: preserve index, follow, max-image-preview:none")

    content = {ORIGIN + route(page.path): page for page in pages.values()
               if page.normal and "noindex" not in page.robots}
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9", "x": "http://www.w3.org/1999/xhtml"}
    listed = set()
    if "sitemap.xml" in files:
        sitemap = ET.parse(root / "sitemap.xml")
        for entry in sitemap.findall("s:url", ns):
            location = entry.findtext("s:loc", default="", namespaces=ns)
            reference("sitemap.xml", location)
            if location in listed:
                errors.append(f"sitemap.xml: duplicate URL {location}")
            listed.add(location)
            page = content.get(location)
            if not page:
                errors.append(f"sitemap.xml: URL is not an indexable content page: {location}")
                continue
            sitemap_alternates = {link.get("hreflang", "").lower(): link.get("href", "")
                                  for link in entry.findall("x:link", ns)}
            if sitemap_alternates != page.alternates:
                errors.append(f"{page.path}: sitemap and HTML hreflang links differ")
    for url in sorted(content.keys() - listed):
        errors.append(f"sitemap.xml: missing content page {url}")
    for url, page in content.items():
        if page.canonicals != [url]:
            errors.append(f"{page.path}: expected one self canonical {url}")
        if page.lang not in {"en", "zh-cn"} or page.alternates.get(page.lang) != url:
            errors.append(f"{page.path}: missing self hreflang for document language")
        if page.alternates.get("x-default") != page.alternates.get("en"):
            errors.append(f"{page.path}: x-default should point to the English page")
        for language, target in page.alternates.items():
            alternate = content.get(target)
            if alternate is None or alternate.alternates != page.alternates:
                errors.append(f"{page.path}: nonreciprocal {language} hreflang: {target}")
    return errors, f"{len(files)} files, {len(pages)} HTML pages, {len(content)} indexable pages, {references} local references"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", nargs="?", type=Path, default=Path(__file__).resolve().parents[1] / "_site")
    args = parser.parse_args()
    try:
        errors, summary = check(args.site.resolve())
    except (OSError, ValueError, ET.ParseError) as error:
        errors, summary = [str(error)], ""
    if errors:
        for error in sorted(set(errors)):
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"Site check failed ({len(set(errors))} issues). {summary}", file=sys.stderr)
        return 1
    print(f"Site check passed: {summary}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
