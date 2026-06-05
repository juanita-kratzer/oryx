# iOS Multi-Target Setup

This project is configured with **multiple Xcode build configurations and schemes** so you can build and archive each app variant without manually changing Xcode settings.

## Targets / Schemes

| Scheme        | Bundle ID                      | Display Name  | Use Case              |
|---------------|--------------------------------|---------------|------------------------|
| OryxAppleWalletCards | `com.oryxjuanita.app`       | Oryx - Apple Wallet Cards | Production |
| Oryx Dev      | `com.oryxjuanita.app.dev`      | Oryx Dev      | Development            |
| Oryx Staging  | `com.oryxjuanita.app.staging`  | Oryx Staging  | Staging / QA           |

## How to Select Each App in Xcode

1. Open `ios/OryxAppleWalletCards.xcodeproj` in Xcode.
2. In the toolbar, click the **scheme selector** (next to the Run/Stop buttons).
3. Choose:
   - **OryxAppleWalletCards** – Production
   - **Oryx Dev** – Development
   - **Oryx Staging** – Staging

Each scheme uses its own build configuration, so you **never need to change Bundle ID, Display Name, or other settings manually**.

## Configuration Locations

| Item               | Location |
|--------------------|----------|
| Build configurations | `ios/OryxAppleWalletCards.xcodeproj/project.pbxproj` |
| Schemes            | `ios/OryxAppleWalletCards.xcodeproj/xcshareddata/xcschemes/` |
| Info.plist (Prod)  | `ios/OryxAppleWalletCards/Info.plist` |
| Info.plist (Dev)   | `ios/OryxAppleWalletCards/Info-Dev.plist` |
| Info.plist (Staging) | `ios/OryxAppleWalletCards/Info-Staging.plist` |
| Entitlements (Prod) | `ios/OryxAppleWalletCards/OryxAppleWalletCards.entitlements` |
| Entitlements (Dev) | `ios/OryxAppleWalletCards/OryxAppleWalletCards-Dev.entitlements` |
| Entitlements (Staging) | `ios/OryxAppleWalletCards/OryxAppleWalletCards-Staging.entitlements` |
| App Icon (Prod)    | `ios/OryxAppleWalletCards/Images.xcassets/AppIcon.appiconset/` |
| App Icon (Dev)     | `ios/OryxAppleWalletCards/Images.xcassets/AppIcon-Dev.appiconset/` |
| App Icon (Staging) | `ios/OryxAppleWalletCards/Images.xcassets/AppIcon-Staging.appiconset/` |
| Firebase (Dev)     | `ios/OryxAppleWalletCards/GoogleService-Info-Dev.plist` |
| Firebase (Staging) | `ios/OryxAppleWalletCards/GoogleService-Info-Staging.plist` |

## Code Signing

Set `APPLE_TEAM_ID` in `.env` (e.g. `D4H4BX9XXY`) to enable **Automatic Signing** for all configurations. The plugin applies this to Prod, Dev, and Staging.

## Firebase

1. Download `GoogleService-Info.plist` from Firebase Console for each environment.
2. Replace the placeholder files:
   - **Production:** Add `GoogleService-Info.plist` to the project (or use Expo’s `ios.googleServicesFile` in app.config.js).
   - **Dev:** Replace `ios/OryxAppleWalletCards/GoogleService-Info-Dev.plist` with your Dev project plist.
   - **Staging:** Replace `ios/OryxAppleWalletCards/GoogleService-Info-Staging.plist` with your Staging project plist.
3. Add a **Run Script** build phase (before “Copy Bundle Resources”) to copy the correct plist per configuration, or add each plist to Copy Bundle Resources and conditionally include based on config (manual setup in Xcode).

## Archiving

Each scheme can be archived independently:

1. Select the scheme (e.g. **Oryx Dev**).
2. **Product → Archive**.
3. Choose the matching provisioning profile in Organizer.

## Regenerating ios/

After changing `app.config.js` or plugins:

```bash
npx expo prebuild --platform ios
```

For a clean rebuild:

```bash
npx expo prebuild --platform ios --clean
```
