const { withDangerousMod, withInfoPlist } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin that:
 * 1. Copies GoogleService-Info.plist into the iOS app bundle
 * 2. Adds use_modular_headers! to Podfile for Firebase Swift compatibility
 * 3. Adds Sign in with Apple entitlement support
 */
function withGoogleServicePlist(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const iosPath = path.join(projectRoot, "ios");

      const src = path.join(projectRoot, "..", "GoogleService-Info.plist");
      const targetName = cfg.modRequest.projectName || "Oryx";
      const dest = path.join(iosPath, targetName, "GoogleService-Info.plist");

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      } else {
        const altSrc = path.join(projectRoot, "GoogleService-Info.plist");
        if (fs.existsSync(altSrc)) {
          fs.copyFileSync(altSrc, dest);
        } else {
          console.warn(
            "[withFirebase] GoogleService-Info.plist not found at:",
            src,
            "or",
            altSrc
          );
        }
      }

      return cfg;
    },
  ]);
}

function withModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const podfilePath = path.join(projectRoot, "ios", "Podfile");

      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, "utf8");

        if (!podfile.includes("use_modular_headers!")) {
          podfile = podfile.replace(
            /^(platform :ios.*)$/m,
            "$1\nuse_modular_headers!"
          );
          fs.writeFileSync(podfilePath, podfile, "utf8");
        }
      }

      return cfg;
    },
  ]);
}

function withAppleSignIn(config) {
  return withInfoPlist(config, (cfg) => {
    if (!cfg.modResults.UIBackgroundModes) {
      cfg.modResults.UIBackgroundModes = [];
    }
    return cfg;
  });
}

function withFirebase(config) {
  config = withGoogleServicePlist(config);
  config = withModularHeaders(config);
  config = withAppleSignIn(config);
  return config;
}

module.exports = withFirebase;
