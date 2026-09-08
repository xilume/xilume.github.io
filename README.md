# Xilume website

Official website for **Xilume / 熙联迈**, an independent hardware brand.

Live site: [xilume.co](https://xilume.co/)

This is a plain HTML, CSS, and JavaScript site, with no application build step. English pages live at the repository root; their Simplified Chinese counterparts live under `zh-cn/` and share the root assets.

## Pages

- `/` — brand and catalog overview
- `/products/` — product catalog
- `/solutions/` and `/applications/` — integration choices and actual installation examples
- `/products/interface-ics/` — production XL1326 and XL1326-A devices, plus XL1108 selection inquiries
- `/documentation/` — engineering resources with direct product guides
- `/documentation/dual-canfd/` — Dual Mini PCIe CAN FD integration guide
- `/documentation/octant-xe826/` — Octant and XE826 integration guide
- `/documentation/interface-ics/` — IC documentation and reference-circuit links
- `/downloads/` — drivers, software, datasheets, and installation-guide links
- `/products/interface-conversion/` — interface product area and product finder
- `/products/8hub/` — 8-channel USB industrial communication hub (model Octant) with two CAN FD, four RS-485, and two RS-232 channels through one USB host
- `/products/8hub-embedded/` — XE826 internal USB communication module
- `/products/usb-dual-can-fd/` and `/products/usb-canfd-rs485/` — selection pages linking to current named products
- `/products/usb-smbus/` — Battery Display Module for Windows and Linux integration
- `/products/mini-pcie-dual-can-fd/` — Dual Mini PCIe CAN FD interface
- `/contact/` — sales and company contact information
- `/about/` — company and development direction

## Local preview

Use Python 3.12+ and Node.js 24. From the repository root, run:

```sh
python scripts/test-site-tools.py
node scripts/test-language-navigation.cjs
python scripts/build-site.py
python scripts/check-site.py _site
python -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Open `http://127.0.0.1:8000/`. On systems where Python is named `python3`, substitute that command. Preview the actual publication artifact: absolute navigation and asset URLs require an HTTP server. The builder replaces only this repository's `_site/`; a custom output directory must be new or empty and outside the source tree.

## Shared layout and maintenance

Read `AGENTS.md`, `docs/WEBSITE_CONTEXT.md` and `docs/WEBSITE_STATUS.md` before maintenance. Use a task branch and preserve existing work. Run `python scripts/sync-site-chrome.py` after adding or updating a normal site page. The script explicitly reads and writes UTF-8, and synchronizes the header, official symbol, footer, skip link, favicon, and shared CSS/JavaScript versions across both languages. It processes pages containing a `site-header`; redirect pages and standalone reports are left alone. Build output and original handoff materials are skipped. Edit the script when changing shared navigation or footer content, then rerun it and review the diff. Bump its `VERSION` when shared cached resources change.

`styles.css` supplies the base layout; `site-refinement.css` is loaded after page styles for shared refinements. Product refinements live in `products/product-refinement.css`, documentation styles in `documentation/docs-support.css`, and company/application styles in `company-applications.css`. Retain reciprocal language links and the correct canonical URL when adding translated pages. Add indexable pages to `sitemap.xml`; omit redirects, `noindex` pages, and temporary QA pages.

## GitHub Pages

The proposed single publication path is `.github/workflows/pages.yml` → `scripts/build-site.py` → checked `_site/` → GitHub Pages. Pull requests run the tool regressions, language-navigation tests, artifact checks and JavaScript syntax checks without uploading or deploying. The workflow deploys only an authorized `main` update or a manual run on `main` after checks pass.

The publication allowlist lives in `scripts/site_files.py`. Add each new root asset there; approved site directories are copied recursively with maintenance files excluded. `scripts/check-site.py` checks the actual artifact, local targets and anchors, sitemap/canonical/hreflang, JSON-LD syntax, manifest resources and the four protected robots tags. It rejects maintenance files in the artifact. Files in this public repository must still contain no secrets or private business information.

**Pending production configuration:** the read-only Pages API check on 2026-09-08 returned `build_type: legacy`, `main`, `/`, with `xilume.co` and HTTPS enforced. An additional dynamic workflow published the repository root, and the existing live README and maintenance script were accessible. Before the first merge of these fixes, obtain explicit publication approval, switch Pages Source to **GitHub Actions** (`build_type: workflow`) while preserving the domain and HTTPS, and verify the setting. A source-code change alone does not fix this live configuration. Do not merge or dispatch a production workflow until this prerequisite is satisfied.

After an authorized deployment, verify the intended Actions run and live pages, navigation, language links and downloads. Confirm `/README.md`, `/AGENTS.md`, `/docs/WEBSITE_CONTEXT.md` and `/scripts/sync-site-chrome.py` return 404. Update `docs/WEBSITE_STATUS.md` with separate modified/tested/pushed/deployed/live-verified states.

## Status

XL1326 and XL1326-A are production devices. Octant and Dual Mini PCIe CAN FD have published single-unit pricing; configurable modules and interface ICs use inquiry-based sample and volume pricing. Product pages and current datasheets are the source of truth for specifications.
