# Shop and hosted checkout

The bilingual Shop runs on Cloudflare Pages. **Real payments remain disabled.**
Keep contact purchasing available. No merchant details, inventory, shipping
decisions or tax declarations may be invented.

## Verified audit — 2026-10-22

Source baseline: 8bc0ea81aa9bcea46642470876b7aba31b07e1c9.
Public English/Chinese Shop pages show contact purchasing and the prices below.
The browser connection did not complete; this audit does not claim current
browser interaction or payment tests passed.

The connected account list contains only **Xilume sandbox**, livemode=false.
Authenticated read-only API calls found existing Products, Prices and Payment
Links. No Stripe objects were changed, no payments attempted and no emails sent.

| Check | Dual Mini PCIe CAN FD | Octant |
| --- | --- | --- |
| Website price | USD 69.99 | USD 199.00 |
| Stripe test unit_amount | 6999 cents | 19900 cents |
| Currency / type | usd / one_time | usd / one_time |
| Product, Price and Payment Link | Active, test mode, SKU mapping matched | Active, test mode, SKU mapping matched |
| Line items | One matching Price, quantity 1 | One matching Price, quantity 1 |
| Adjustable quantity | Not configured | Not configured |
| Completion | Stripe hosted confirmation | Stripe hosted confirmation |
| Shipping | US address collection is explicitly illustrative; no rates | Same |
| Tax | Automatic tax false; tax behavior unspecified; product tax code unset | Same |

The sandbox /v1/webhook_endpoints list was empty. The repository has no order
backend or webhook handler. Invoice creation does not prove receipt delivery.
These reads do not establish live merchant verification or payouts.

## Completed code and regression coverage

- Bilingual Shop/review routes, product CTAs, contact-prefill and price consistency
- No card collection, site login, fake success page, order store or stock reservation
- Independent XILUME_CHECKOUT_ENABLED switch: only boolean true allows a maintained
  payment link. Missing/false/malformed configuration keeps contact purchasing
- Strict original URL validation: rejects test URLs, non-Stripe hosts, credentials,
  query/fragment, whitespace, ports and normalized dot/backslash paths
- Duplicate payment targets for two SKUs fail closed
- Release regression requires switch false and both links null. Activation needs
  a separate reviewed configuration/test change after launch requirements pass
- 22 offline Shop checks; 40 offline Stripe audit tests covering amount, currency,
  SKU, mode, inactive/recurring/variable prices, line items, quantities, account
  mismatch, malformed config, GET-only transport and redacted errors

The browser switch is an accidental-deployment safeguard, not payment
authorization, an inventory lock or a way to deactivate a public Stripe link.

## Read-only price audit

scripts/audit-stripe-prices.cjs uses Node 24 without new dependencies. It reads
the authenticated account, Product, Price, Payment Link and line items. It only
uses GET at the fixed Stripe API origin, refuses redirects and never writes,
charges, refunds, sends messages or changes the website.

1. Copy docs/stripe-shop-audit.example.json outside the repository. Set the
   intended account/mode and owner-reviewed Product/Price/Payment Link IDs
2. Product, Price and Link metadata must identify the SKU as
   XILUME-DUAL-MINIPCIE-CAN-FD or XILUME-OCTANT. Also inspect the actual product
   description in Dashboard; metadata is not proof of physical product identity
3. Supply a restricted key with only needed read permissions through the secret
   store/environment variable STRIPE_READ_ONLY_KEY. Never paste credentials into
   source, chat, command arguments or committed environment files
4. Run: node scripts/audit-stripe-prices.cjs /outside/repo/config.json

Exit 0 means only that price/link checks passed. readyForLivePayments always
remains false: this tool cannot certify merchant approval, stock, shipping,
policies, taxes, order delivery or payment tests. The null example IDs are
intentional. Raw account/API responses and keys are not logged.

Both authenticated sandbox snapshots passed this validator. The CLI's direct
authenticated network transport was not exercised with a key.

Checks cover base USD pricing. Payment Links can present localized currency
through Adaptive Pricing; verify actual customer currency and final totals.
Quantity limits require owner decisions. A completed-payment limit counts
checkouts, not units sold, and is not an inventory system.

## Required order confirmation before launch

Stripe hosted confirmation is the customer-facing payment result. Returning to
a URL, supplying status=paid/session_id or submitting the contact form cannot
mark an order paid. Contact auto-replies acknowledge inquiries only.

A verified webhook and durable order record are required before this rollout:

1. Verify Stripe signatures against the raw request body with a separate
   environment-specific signing secret
2. Handle checkout.session.completed and checkout.session.async_payment_succeeded.
   For these paid SKUs retrieve the Session and require mode=payment,
   status=complete, payment_status=paid and the intended test/live mode.
   Handle checkout.session.async_payment_failed without marking an order paid
3. Retrieve complete line items server-side and check merchant, Payment Link,
   Product/Price, quantities, base prices and owner-approved shipping/tax/
   discounts/currency rules. Never trust visitor-provided totals
4. Persist Session ID and processing state using uniqueness constraints and
   transactional/idempotent handling. Different events for the same Session,
   concurrent deliveries and retries must not duplicate orders or shipments
5. Acknowledge only after durable recording; retry transient failures, test
   out-of-order events and retain Dashboard reconciliation
6. Send order acknowledgments and update inventory from verified payment state.
   Keep card data with Stripe; protect access to orders and addresses.
   Test receipt delivery separately from configuration

The static site does not implement this backend. Endpoint hosting, durable
storage and notifications remain engineering work, not owner KYC. No service
was provisioned in this audit. Manual shipping through Dashboard can remain,
with payment status checked before shipping; reliable order capture is still
required for this rollout.

## Owner actions — deliberately not filled in

| Action | Evidence needed |
| --- | --- |
| Select actual merchant, country and legal business type | Correct live account, not inferred from residence, brand or sandbox |
| Complete activation and identity checks | Actual business/legal details, requested tax IDs, representative/ownership details and documents/checks entered directly in Stripe |
| Link and verify payout bank account; accept terms | Owner completes bank authentication/verification and required declarations |
| Resolve Stripe account requirements | Payments and payouts enabled, no blocking requirements |
| Confirm sellable stock and quantity limits for each SKU | Actual counts and handling for overselling; no historical estimates |
| Decide destinations, rates, dispatch and fulfillment | Explicit decisions, no assumed worldwide/free/US-only shipping |
| Approve refunds/returns, warranty, privacy and public business details | Actual policies, contact and statement descriptor |
| Confirm taxes, registrations, tax behavior and product classification | Owner/tax adviser confirms actual obligations; no assumed exemption or automatic-tax activation without applicable registrations |

Exact identity requirements depend on country, entity and Stripe's account
requirements. Private identity and banking material must stay out of GitHub.

## Acceptance and activation

| Scenario | Required outcome | Evidence now |
| --- | --- | --- |
| Both SKUs and languages | Correct product/price/contact route/approved target | Offline covered; browser incomplete |
| URL, amount and test/live mix-up | Reject bad config, no false success | Offline covered |
| Hosted test success | Correct totals, paid Session, one durable order | Not performed |
| Decline and authentication | No paid order on failure; authentication handled | Not performed |
| Abandon/cancel/back/reload | No false order, return to Shop/contact | Not performed |
| Asynchronous success/failure | Fulfill only after confirmed paid | No endpoint yet |
| Forged/duplicate/concurrent/reordered events | Reject forgery, one order, safe retries | No endpoint yet |
| Quantity/stock/shipping/tax | Approved limits/totals and stock handling | Owner decisions and testing pending |
| Receipts/order acknowledgment | Correct content/recipient and actual delivery | Not performed |
| Live account and objects | Separate review and owner-arranged payment verification | No live account connected |

Keep test links out of public configuration. Complete owner decisions, merchant
verification, backend delivery and sandbox acceptance; inspect matching live
objects and agree the live verification arrangement with the owner. Enable links
and the switch only in a reviewed activation change after these checks pass.
Keep contact purchasing available afterward.

Rollback: disable the switch and clear links. If direct Stripe access must stop,
also deactivate the affected links there. Existing orders still need reconciliation.

## Hosting and checks

Retain Cloudflare Pages, the static site, domain and email. The old GitHub Pages
workflow remains checks-only. See WEBSITE_CLOUDFLARE.md and WEBSITE_STATUS.md.
Publish only _site; scripts/docs/credentials/audit snapshots must be excluded.

Run existing tool/navigation/contact checks, node scripts/test-shop.cjs,
node --test scripts/test-stripe-prices.cjs, build/artifact and JS syntax checks.
Review pages remain noindex. Offline tests, browser QA and actual payments must
always be reported separately.

## Official references

- https://docs.stripe.com/payment-links/create
- https://docs.stripe.com/payment-links/customize
- https://docs.stripe.com/payment-links/post-payment
- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks
- https://docs.stripe.com/get-started/account/set-up
- https://docs.stripe.com/get-started/checklist/go-live
- https://docs.stripe.com/keys-best-practices
