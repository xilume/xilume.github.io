# Shop and hosted checkout

Prepared 2026-10-11. This change is a review branch, not an active payment service.

## Publication blocker

The existing official site is hosted on GitHub Pages. Its usage limits explicitly
exclude hosting an online business or e-commerce site:
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Do not merge this feature into the Pages deployment branch as a live store.
The owner has previously required GitHub Pages; a commerce-compatible hosting
choice must be approved before deployment. Keep the existing repository and
xilume.co domain. No migration, DNS change or new hosting account was performed.

## Implemented

- Bilingual Shop, shared navigation/footer links, and per-product review routes
- Existing USD prices: Dual Mini PCIe CAN FD 69.99; Octant 199.00
- Existing product-page purchase CTAs route to the matching review page
- Fixed public Stripe Payment Link configuration in `shop/payment-links.js`
- No link configured means a clear unavailable state and contact-order fallback
- Contact form prefills only the known product and public unit price; it never
  submits automatically or copies arbitrary URL parameters
- No customer sign-in, payment-data collection, local order store or fake
  payment-success page; no mixed-product cart or inventory reservation

One SKU per checkout is deliberate. Stripe Payment Links allow quantities to be
adjusted on the hosted payment page, but their supported buyer URL parameters do
not include quantity. Do not introduce `?quantity=…` or a client-provided amount.
For mixed baskets, use a hosted commerce platform or a server-created Checkout
Session with server-owned prices, stock checks and verified webhooks.

## Activate after hosting is resolved

1. Connect the merchant's Stripe account and finish Stripe's account activation.
   A suggested connection is not proof that an account exists or accepts payments.
2. In that account create/verify two one-time fixed USD prices matching the site.
   Do not use recurring or customer-entered prices.
3. Create one Payment Link per SKU. Enable adjustable quantity with an owner-
   confirmed limit; collect the buyer's email, name and shipping address.
4. Confirm actual sellable stock, shipping countries/rates, dispatch estimates,
   tax configuration, returns/warranty terms and customer-facing merchant details.
   Do not invent these or enable worldwide/free shipping by default.
5. Configure Stripe receipt emails and its hosted payment confirmation. Link the
   merchant's actual terms/privacy information in the payment settings.
6. Verify product, currency, quantity changes, shipping and total in Stripe test
   mode. Test links must not be published in `payment-links.js`.
7. Verify the matching live links and put their plain `https://buy.stripe.com/…`
   URLs in the two null fields. The public URL is not a secret; API keys are.
8. Perform desktop/mobile browser QA and publish on the approved host. Complete
   any live payment verification with the merchant's explicit test arrangement.

`catalog.js` rejects non-HTTPS, non-Stripe, test-mode, credential-bearing, query-
bearing and fragment-bearing URLs. This is URL validation, not merchant account,
inventory or price verification. Maintainers must verify the Stripe objects.

## Orders and accounts

For low volume, manage payments and shipping addresses in Stripe Dashboard,
check successful payment status, and fulfil manually. A completed return URL
is not evidence of payment. A Payment Link's completed-payment limit counts
checkouts, not the number of units sold, so it is not an inventory system.

An optional later customer account can use email-code or email-link sign-in.
Store its user ID and authorized orders, shipments and addresses in a backend;
keep payment details with Stripe. A Stripe customer record is not a website
login. Require authenticated ownership for order lookup; never expose orders
just because a visitor supplied an email address.

## References

- NVIDIA allows guest orders as well as account-based invoice access:
  https://marketplace.nvidia.com/en-us/faqs/
- Payment Link quantities, addresses and settings:
  https://docs.stripe.com/payment-links/customize
- Confirmation, receipt emails and payment records:
  https://docs.stripe.com/payment-links/post-payment
- Payment verification and fulfilment:
  https://docs.stripe.com/checkout/fulfillment

## Checks

Run the existing site tests/build plus `node scripts/test-shop.cjs`. Build output
must include `shop/`, and only the two Shop catalog pages belong in the sitemap;
purchase-review pages are noindex. This repository's CI checks a PR without
deployment. Browser and real-payment tests are separate from offline checks.
