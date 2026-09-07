# Xilume website

Official website for **Xilume**, an independent hardware brand created by Xilong Chen.

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

Run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000/`. Use an HTTP server because navigation and asset URLs include paths relative to the site root.

## Shared layout and maintenance

Run `python3 scripts/sync-site-chrome.py` after adding or updating a normal site page. The script synchronizes the header, official symbol, footer, skip link, favicon, and shared CSS/JavaScript versions across both languages. It processes pages containing a `site-header`; redirect pages and standalone reports are left alone. Edit the script when changing shared navigation or footer content, then rerun it.

`styles.css` supplies the base layout; `site-refinement.css` is loaded after page styles for shared refinements. Product refinements live in `products/product-refinement.css`, documentation styles in `documentation/docs-support.css`, and company/application styles in `company-applications.css`. Retain reciprocal language links and the correct canonical URL when adding translated pages. Add indexable pages to `sitemap.xml`; omit redirects, `noindex` pages, and temporary QA pages.

## GitHub Pages

Pushes to `main` deploy through `.github/workflows/pages.yml` to [xilume.co](https://xilume.co/). The workflow copies an explicit set of root files and site directories into `_site/` before uploading it to GitHub Pages.

Every new root asset must be added to the workflow's `cp` file list. This currently includes both `site-refinement.css` and `company-applications.css`; otherwise a stylesheet can work locally but return 404 after deployment. Files inside the copied `products/`, `documentation/`, `downloads/`, `images/`, `media/`, and `zh-cn/` directories are included recursively. Development files such as `scripts/` and this README are not published.

## Status

XL1326 and XL1326-A are production devices. Octant and Dual Mini PCIe CAN FD have published single-unit pricing; configurable modules and interface ICs use inquiry-based sample and volume pricing. Product pages and current datasheets are the source of truth for specifications.
