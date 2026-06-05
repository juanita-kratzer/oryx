# Troubleshooting

## "Add to Wallet" doesn't work

- Use Safari on an iPhone (Chrome may not offer the correct prompt).
- Ensure the pass has at least one image (card or logo). Edit your card and add an image if needed.
- If you see an error, try again in a few minutes; pass generation can fail temporarily (e.g. image fetch). Check status page and admin error dashboard.

## NFC tag not opening the link

- Hold the phone flat against the tag for 1–2 seconds.
- Confirm the tag was written with the correct full URL (including `https://`).
- Try writing the tag again with an NFC app (see [NFC guide](/help/nfc)).

## Pass shows old info

- Regenerate the pass: open your card in the dashboard and use "Add to Wallet" again (or the pass preview if available). The new pass will reflect the latest card data.

## I hit the card limit

- Free plan allows one card. Upgrade to Pro from the Billing page for unlimited cards.

## Billing / subscription not updating

- Stripe webhooks must be configured. Check the [status](/status) page for "Last Stripe webhook". If it's stale, verify your webhook URL and signing secret in Stripe Dashboard.

## Something else

- Check the [status](/status) page for system health.
- Contact support (see [Contact](/contact)).
