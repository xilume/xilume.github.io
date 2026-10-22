# Xilume website

Official website for **Xilume / 熙联迈**, an independent hardware brand.

Live site: [xilume.co](https://xilume.co/)

This is a plain HTML, CSS, and JavaScript site, with no application build step. English pages live at the repository root; their Simplified Chinese counterparts live under `zh-cn/` and share the root assets.

## Pages

- `/` — brand and catalog overview
- `/products/` — product catalog
- `/shop/` — priced hardware and purchase options (prepared; see `docs/WEBSITE_SHOP.md` before activation)
- `/shop/checkout/` — per-product review and hosted-payment handoff; no payment links active
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
- `/contact/` — direct pricing, product selection and support inquiries, plus email and phone contact options
- `/about/` — company and development direction

## Local preview

Use Python 3.12+ and Node.js 24. From the repository root, run:

```sh
python scripts/test-site-tools.py
node scripts/test-language-navigation.cjs
node scripts/test-contact-form.cjs
node scripts/test-shop.cjs
node --test scripts/test-stripe-prices.cjs
python scripts/build-site.py
python scripts/check-site.py _site
python -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Open `http://127.0.0.1:8000/`. On systems where Python is named `python3`, substitute that command. Preview the actual publication artifact: absolute navigation and asset URLs require an HTTP server. The builder replaces only this repository's `_site/`; a custom output directory must be new or empty and outside the source tree.

## Shared layout and maintenance

Read `AGENTS.md`, `docs/WEBSITE_CONTEXT.md` and `docs/WEBSITE_STATUS.md` before maintenance. Use a task branch and preserve existing work. Run `python scripts/sync-site-chrome.py` after adding or updating a normal site page. The script explicitly reads and writes UTF-8, and synchronizes the header, official symbol, footer, skip link, favicon, and shared CSS/JavaScript versions across both languages. It processes pages containing a `site-header`; redirect pages and standalone reports are left alone. Build output and original handoff materials are skipped. Edit the script when changing shared navigation or footer content, then rerun it and review the diff. Bump its `VERSION` when shared cached resources change.

On 2026-09-08, the owner explicitly authorized publishing this and future routine maintenance fixes to `xilume.co` after testing and review. Follow task branch → tests and review → merge → production deployment → live verification → status update, without requesting publication permission again for each routine fix. This does not authorize changes to the Logo, model specifications, prices, domain, large-scale page deletion, or unrelated configuration.

`styles.css` supplies the base layout; `site-refinement.css` is loaded after page styles for shared refinements. Product refinements live in `products/product-refinement.css`, documentation styles in `documentation/docs-support.css`, and company/application styles in `company-applications.css`. Retain reciprocal language links and the correct canonical URL when adding translated pages. Add indexable pages to `sitemap.xml`; omit redirects, `noindex` pages, and temporary QA pages.

## Cloudflare Pages and CI

On 2026-10-11, the owner authorized migration to Cloudflare Pages while retaining
the repository, domain and business email. See `docs/WEBSITE_CLOUDFLARE.md` for the
staging and cutover procedure, and `docs/WEBSITE_STATUS.md` for verified progress.
The preview was verified, PR #16 merged, and `xilume.co` switched to Pages.
See `docs/WEBSITE_STATUS.md` for deployed SHAs, production validation and the
separate disabled-payment status.

Cloudflare Pages Free uses Git integration with `xilume/xilume.github.io`: production branch `main`, preview branch `codex/cloudflare-20261011`, framework preset None and repository-root build directory. The build command is `python scripts/build-site.py && python scripts/check-site.py _site`; the output directory is `_site`. Publish that checked output, never the repository root. Confirm the deployed SHA, build log and preview `X-Robots-Tag: noindex` response before promotion.

`.github/workflows/pages.yml` runs checks only for pull requests, website changes on `main` and manual runs. It retains Python 3.12 and Node.js 24 regressions, the build, artifact checks and JavaScript syntax checks; it neither uploads nor deploys to GitHub Pages. Pushes changing only `AGENTS.md`, `README.md` or `docs/**` skip GitHub CI; pull requests still run checks. Cloudflare Git builds are controlled separately in the Pages project.

The publication allowlist lives in `scripts/site_files.py`. Add each new root asset there; approved site directories are copied recursively with maintenance files excluded. `scripts/check-site.py` checks the actual artifact, local targets and anchors, sitemap/canonical/hreflang, JSON-LD syntax, manifest resources and the four protected robots tags. It rejects maintenance files in the artifact. Files in this public repository must still contain no secrets or private business information.

**Historical GitHub Pages release, 2026-09-08:** the pre-migration Pages API check found legacy branch publishing alongside the custom workflow. Following the owner's authorization, Source was switched to **GitHub Actions** and verified at `2026-09-08T07:53:30Z`: `build_type: workflow`, `cname: xilume.co`, `https_enforced: true`. The retained `source: main /` field does not override the workflow build type. PR #3 deployed commit `322902a62883e701a2c348ced358e73e07146972` successfully in [Actions run 34202648965](https://github.com/xilume/xilume.github.io/actions/runs/34202648965). Live checks confirmed all 200 publication files accessible, 115 text resources matching the artifact and six maintenance paths returning 404. See `docs/WEBSITE_STATUS.md` for evidence and validation limits.

After deployment, verify the intended Cloudflare deployment SHA and live pages, navigation, language links and downloads. Confirm `/README.md`, `/AGENTS.md`, `/docs/WEBSITE_CONTEXT.md` and `/scripts/sync-site-chrome.py` return 404. Update `docs/WEBSITE_STATUS.md` with separate modified/tested/pushed/deployed/live-verified states. Follow `docs/WEBSITE_CLOUDFLARE.md` for migration and cutover; `docs/WEBSITE_RELEASE.md` retains the previous GitHub Pages release and recovery procedure.

## Status

XL1326 and XL1326-A are production devices. Octant and Dual Mini PCIe CAN FD have published single-unit pricing; configurable modules and interface ICs use inquiry-based sample and volume pricing. Product pages and current datasheets are the source of truth for specifications.
