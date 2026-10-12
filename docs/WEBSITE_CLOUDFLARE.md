# Cloudflare Pages migration

Prepared 2026-10-11 following the owner's explicit migration authorization.
Current deployment evidence belongs in `WEBSITE_STATUS.md`; this guide does not
claim that a Cloudflare project, DNS change or live payment service is complete.

## Verified project, 2026-10-11

The Git-integrated Pages project is `xilume`, production `main`, with automatic
previews limited to `codex/cloudflare-20261011`. Build image version 3 uses
`PYTHON_VERSION=3.12.14` in production and preview. The specified build command,
repository-root directory and `_site` output were verified in the dashboard and
successful build log. Initial main deployment is a separate baseline; it is not
the Shop preview or proof of a custom-domain cutover.

Preview `530c650d-b40a-467c-bf87-f2b85266446b` deployed
`7745ed6c98ea88d26fd2acbb2c1ed89df14ee422` successfully:
[atomic URL](https://530c650d.xilume.pages.dev/) and
[branch alias](https://codex-cloudflare-20261011.xilume.pages.dev/).
The live artifact, HTTP indexing/404 behavior and desktop/mobile browser checks
passed; see `WEBSITE_STATUS.md` for exact scope and remaining checks.

The Free DNS zone is active. Its initial automatic scan omitted the actual
Dynadot DKIM CNAME, demonstrating why a complete provider backup is required.
The complete backup remains outside the public repository: six explicit CSV/UI
records plus the captured Dynadot Email Hosting mode and four generated mail
records, including TTL, DDNS and DNSSEC state. All ten pre-cutover records were
checked against both assigned Cloudflare authoritative servers.

PR #16 has since merged as `ad4778f280c9f0949be18da53ba99035cafaa235`.
The merge deployment `9b2fb074-acfb-4f38-a716-edd6cc83471e` was verified at
`xilume.pages.dev`. The subsequent documentation-only commit
`d8a34910f473ef75cb4b6d9aeff461bb6a705c26` deployed as production `52de383d`
and preview `f09109af`; both logs confirm the specified build and 216 files.
The preview returns `X-Robots-Tag: noindex`. The old workflow runs checks only.

The registrar accepted the two assigned Cloudflare nameservers on 2026-10-11;
DNSSEC is Not Set and no DS is published. Parent delegation took effect at
17:21 PDT, independently confirmed by Cloudflare and Google recursive resolvers.
Pages domain activation replaced only the four old website A records and the
www CNAME with two proxied CNAME records targeting `xilume.pages.dev`.
MX, SPF, DKIM, DMARC and Google verification remain unchanged and DNS only;
the resulting zone has seven records. Registrar and email remain at Dynadot.

The Universal SSL certificate is Active for the apex and `*.xilume.co`, and
Always Use HTTPS is enabled. At 17:35 PDT both `xilume.co` and `www.xilume.co`
are Active with SSL enabled in the Pages dashboard.
The Single Redirect `www to xilume.co` uses the exact www hostname, status 301,
`concat("https://xilume.co", http.request.uri.path)` and preserve-query enabled.
Its match excludes `/.well-known/acme-challenge/` so it cannot intercept Pages
HTTP certificate validation. This was verified against the initially blocked
random challenge route following the official [debugging guidance](https://developers.cloudflare.com/pages/configuration/debugging-pages/#blocked-http-validation).
Email Address Obfuscation is Off to preserve existing public mailto links and
the checked artifact without injected decode scripts; only the 51 affected
HTML files needed rechecking after this setting changed.
At 17:27 PDT, real HTTPS, HTTP/www redirects with path/query preservation,
unknown/maintenance 404s and DNS/mail preservation passed. Exact final domain
dashboard status and complete production artifact/browser scope belong in
`WEBSITE_STATUS.md`. At 17:30 PDT all 216 artifact files and 28 desktop/mobile
page checks plus seven interactions passed on the official domain.

## Scope and build settings

Keep the existing GitHub repository, static HTML/CSS/JavaScript, `xilume.co` and
business mailbox. Use Cloudflare Pages Free for the static site. The domain can
remain registered with Dynadot; its authoritative DNS changes separately.

| Setting | Value |
| --- | --- |
| Repository | `xilume/xilume.github.io` |
| Framework preset | None |
| Root directory | Repository root |
| Build command | `python scripts/build-site.py && python scripts/check-site.py _site` |
| Build output directory | `_site` |
| Preview branch | `codex/cloudflare-20261011` |
| Production branch | `main` |

Use a supported Python 3.12+ build runtime. No npm install, server, Functions,
Wrangler configuration, account ID or project ID is needed for this static build.
Run the existing regression checks in GitHub CI before promoting the commit.
Restrict the Cloudflare GitHub app's access to this repository.

Never publish the repository root. `scripts/site_files.py` remains the publication
allowlist. `_site/404.html` is required: without a root `404.html`, Cloudflare
Pages treats unmatched routes as a single-page app and returns the home page.
The bilingual error page uses absolute asset links so it works at nested paths.
Keep it `noindex` and out of the sitemap.

## Staging verification

1. Create the project with `main` as the production branch and enable preview
   builds for `codex/cloudflare-20261011`. Deploy the migration branch as a preview.
   A branch's name does not make it a preview: a branch selected as production
   does not receive Cloudflare's automatic preview `noindex` header. Keep the
   existing GitHub Pages workflow and custom domain unchanged during this step.
2. Confirm the Cloudflare deployment's source SHA and build log. Compare the
   served pages and downloads to the checked `_site` artifact.
3. Check English and Chinese navigation, mobile layout, product links, Shop,
   checkout's unavailable-payment state, contact form, images and downloads.
   FormSubmit may require source activation for a new hostname; do not call a
   form successful merely because the page or vendor endpoint returns HTTP 200.
4. Require HTTP 404 for `/README.md`, `/AGENTS.md`,
   `/docs/WEBSITE_CONTEXT.md`, `/scripts/sync-site-chrome.py`, `/.git/config` and
   an unknown nested route. Confirm they do not return the home page or source.
5. Check existing compatibility routes and query strings. Pages redirects
   `*.html` URLs to their extensionless forms and `*/index.html` to the directory
   form. Do not add broad rewrites or change the site's canonical URL structure.
6. Preserve production canonicals and ensure preview deployments are excluded
   from indexing; confirm Cloudflare's preview `X-Robots-Tag` behavior.

Current Free plan checks: no more than 20,000 files and no asset over 25 MiB.
Static requests are free and unlimited; Functions, if added later, have separate
Workers quotas and pricing. No payment processing is provided by Pages itself.

## Domain cutover

1. Export or record the current DNS configuration outside this public repository.
   Preserve all required MX, SPF, DKIM, DMARC, verification and mail-host records.
   Cloudflare's DNS scan is not a complete backup. Email-host records must use
   the provider's required DNS-only setup.
2. Add `xilume.co` as a Cloudflare zone on the Free plan and verify the copied
   records. Before changing nameservers, handle any active registrar DNSSEC/DS
   configuration according to Cloudflare's migration instructions.
3. After staging passes, add `xilume.co` and `www.xilume.co` in Pages Custom
   domains. Complete the required DNS changes; adding a CNAME alone without the
   Pages domain association is insufficient. A root domain on Pages requires
   Cloudflare nameservers. Keep the domain registered with its existing registrar.
4. Wait for active domain and certificate status. Verify HTTPS, the intended
   www-to-apex behavior, pages, downloads, blocked maintenance paths and email
   service. Record observed results rather than promising zero propagation delay.
5. Retire the old GitHub Pages deployment path only after the new host is
   verified. Before merging Shop into `main`, convert the old workflow to checks
   only so the store is never deployed through GitHub Pages. Set Cloudflare's
   production branch to `main` and verify the intended merged SHA is served.
6. Re-enable DNSSEC with the new provider's configuration if it was disabled.
   Preserve the last known-good deployment and previous DNS values for recovery.

Payment activation remains a separate task under `WEBSITE_SHOP.md`. Keep public
Stripe links unset until the actual merchant setup and payment tests are complete.
Never put account emails, credentials, private orders or buyer data in the repo.

## Official references

- [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Build runtime](https://developers.cloudflare.com/pages/configuration/build-image/)
- [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Serving Pages and 404 behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Static assets and Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Nameservers and DNSSEC](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
