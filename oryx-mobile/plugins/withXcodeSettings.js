const { withXcodeProject, withInfoPlist, withEntitlementsPlist } = require("expo/config-plugins");

/**
 * Expo config plugin that applies persistent Xcode build settings so they
 * survive `expo prebuild --clean`. Every setting that would normally require
 * manual clicks in Xcode is encoded here instead.
 *
 * Current captured settings (Apr 2026):
 *   - Development Team:  D4H4BX9XXY
 *   - Display Name:      Oryx Wallet Cards
 *   - App Category:      public.app-category.business
 *   - Deployment Target: 15.1
 *   - Device Families:   iPhone + iPad (1,2)
 *   - Bitcode:           disabled
 */
function unquote(val) {
  if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
    return val.slice(1, -1);
  }
  return val;
}

function withXcodeBuildSettings(config) {
  return withXcodeProject(config, (projectConfig) => {
    const project = projectConfig.modResults;
    const targetName = "Oryx";
    const bundleId = "com.oryxjuanita.app";

    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      const buildConfig = configurations[key];
      if (typeof buildConfig !== "object" || !buildConfig.buildSettings) continue;

      const bs = buildConfig.buildSettings;
      const isAppTarget =
        unquote(bs.PRODUCT_NAME) === targetName ||
        unquote(bs.PRODUCT_BUNDLE_IDENTIFIER) === bundleId;

      if (!isAppTarget) continue;

      bs.DEVELOPMENT_TEAM = process.env.APPLE_TEAM_ID || "D4H4BX9XXY";
      bs.INFOPLIST_KEY_CFBundleDisplayName = '"Oryx Wallet Cards"';
      bs.INFOPLIST_KEY_LSApplicationCategoryType =
        '"public.app-category.business"';
      bs.IPHONEOS_DEPLOYMENT_TARGET = "15.1";
      bs.TARGETED_DEVICE_FAMILY = '"1,2"';
      bs.MARKETING_VERSION = config.version || "1.0.0";
      bs.CURRENT_PROJECT_VERSION = "8";
      bs.ENABLE_BITCODE = "NO";
      bs.VERSIONING_SYSTEM = '"apple-generic"';
    }

    return projectConfig;
  });
}

function withInfoPlistSettings(config) {
  return withInfoPlist(config, (plistConfig) => {
    const plist = plistConfig.modResults;

    plist.CFBundleDisplayName = "Oryx Wallet Cards";
    plist.LSMinimumSystemVersion = "15.1";
    plist.ITSAppUsesNonExemptEncryption = false;

    plist.UIRequiredDeviceCapabilities = ["arm64"];
    plist.UIRequiresFullScreen = false;
    plist.UIStatusBarStyle = "UIStatusBarStyleDefault";
    plist.UIViewControllerBasedStatusBarAppearance = false;
    plist.CADisableMinimumFrameDurationOnPhone = true;

    plist.UISupportedInterfaceOrientations = [
      "UIInterfaceOrientationPortrait",
      "UIInterfaceOrientationPortraitUpsideDown",
    ];
    plist["UISupportedInterfaceOrientations~ipad"] = [
      "UIInterfaceOrientationPortrait",
      "UIInterfaceOrientationPortraitUpsideDown",
      "UIInterfaceOrientationLandscapeLeft",
      "UIInterfaceOrientationLandscapeRight",
    ];

    plist.NSCameraUsageDescription =
      "Allow $(PRODUCT_NAME) to access your camera";
    plist.NSMicrophoneUsageDescription =
      "Allow $(PRODUCT_NAME) to access your microphone";
    plist.NSPhotoLibraryUsageDescription =
      "Allow $(PRODUCT_NAME) to access your photos";
    plist.NSFaceIDUsageDescription =
      "Allow $(PRODUCT_NAME) to access your Face ID biometric data.";

    return plistConfig;
  });
}

function withFrameworkDsyms(config) {
  return withXcodeProject(config, (projectConfig) => {
    const project = projectConfig.modResults;

    const scriptName = "Generate Framework dSYMs";
    const shellScript = `
if [ "\${CONFIGURATION}" = "Release" ]; then
  for FW in hermes React ReactNativeDependencies; do
    DSYM_OUT="\${DWARF_DSYM_FOLDER_PATH}/\${FW}.framework.dSYM"
    [ -d "\${DSYM_OUT}" ] && continue

    FW_BIN=$(find "\${PODS_ROOT}" -path "*/ios-arm64/\${FW}.framework/\${FW}" -type f 2>/dev/null | head -1)

    if [ -n "\${FW_BIN}" ]; then
      xcrun dsymutil "\${FW_BIN}" -o "\${DSYM_OUT}" 2>/dev/null || true
    fi
  done
fi
`.trim();

    const phases = project.hash.project.objects["PBXShellScriptBuildPhase"] || {};
    const alreadyAdded = Object.values(phases).some(
      (phase) =>
        typeof phase === "object" &&
        (phase.name === `"${scriptName}"` ||
         phase.name === '"Generate Hermes dSYM"' ||
         phase.name === '"Generate Framework dSYMs"')
    );
    if (alreadyAdded) return projectConfig;

    const target = project.getFirstTarget();
    project.addBuildPhase(
      [],
      "PBXShellScriptBuildPhase",
      scriptName,
      target.uuid,
      { shellPath: "/bin/sh", shellScript }
    );

    return projectConfig;
  });
}

function withOryxXcodeSettings(config) {
  config = withXcodeBuildSettings(config);
  config = withInfoPlistSettings(config);
  config = withFrameworkDsyms(config);
  return config;
}

module.exports = withOryxXcodeSettings;
