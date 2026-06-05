# RevenueCat Setup for Oryx Wallet Cards

## 1. RevenueCat Dashboard Configuration

### Create project & connect stores
1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Create a project (or use existing)
3. Connect **App Store Connect**:
   - Add iOS app with Bundle ID: `com.oryxjuanita.app`
   - Add **App-Specific Shared Secret** from App Store Connect → Your app → App Information

### Create entitlement
1. **Entitlements** → Create entitlement
2. **Identifier:** `Oryx Wallet Cards Pro` (must match `ENTITLEMENT_PRO` in code)
3. Attach product `oryx_premium_monthly` from App Store Connect

### Create offering
1. **Offerings** → Create offering (e.g. "default")
2. Add package with product `oryx_premium_monthly` (monthly)
3. Set as current offering

### Create paywall
1. **Paywalls** → Create paywall
2. Link to your offering
3. Customize layout, copy, and design in the dashboard

### Customer Center (Pro/Enterprise plan)
1. **Customer Center** → Configure
2. Enable options: restore purchases, manage subscription, cancel, etc.
3. Add support email for "contact support" flow

---

## 2. API Keys

- **Development:** Use Test Store key (`test_xxx`) – works without App Store
- **Production:** Use iOS-specific key from Project → API Keys → App-specific keys

Set in `.env`:
```
EXPO_PUBLIC_REVENUECAT_API_KEY=your_key_here
```

---

## 3. App Store Connect

- Product ID: `oryx_premium_monthly`
- Subscription group: Oryx Wallet Cards
- Add prices and localizations (fix "Missing Metadata" before submission)

---

## 4. Testing

**Development builds required** – In-app purchases do not work in Expo Go.

```bash
# Build for iOS simulator
npx expo run:ios

# Or with EAS
eas build --platform ios --profile development
```

Use **Sandbox** test account (App Store Connect → Users and Access → Sandbox testers).

---

## 5. Usage in Code

### Check Pro status
```ts
const { isPro, customerInfo } = useRevenueCat();
```

### Present paywall
```ts
await RevenueCatUI.presentPaywallIfNeeded({
  requiredEntitlementIdentifier: "Oryx Wallet Cards Pro",
  displayCloseButton: true,
});
```

### Customer Center (manage subscription)
```ts
await RevenueCatUI.presentCustomerCenter();
```

### Protect a feature
```tsx
<ProGate onUnlock={() => setUnlocked(true)}>
  <ProOnlyFeature />
</ProGate>
```
