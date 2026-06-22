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

      const src = path.join(projectRoot, "GoogleService-Info.plist");
      const targetName = cfg.modRequest.projectName || "Oryx";
      const dest = path.join(iosPath, targetName, "GoogleService-Info.plist");

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      } else {
        console.warn("[withFirebase] GoogleService-Info.plist not found at:", src);
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

        // Bump platform to 16.0 for ML Kit compatibility
        podfile = podfile.replace(
          /^platform :ios,.*$/m,
          "platform :ios, '16.0'"
        );

        // Remove use_modular_headers! if present (not compatible with RNFB)
        podfile = podfile.replace(/^use_modular_headers!\n?/m, "");

        // Add $RNFirebaseAsStaticFramework flag
        if (!podfile.includes("RNFirebaseAsStaticFramework")) {
          podfile = podfile.replace(
            /^(platform :ios.*)$/m,
            `$RNFirebaseAsStaticFramework = true\n$1`
          );
        }

        // Disable pre-compiled RN distribution (conflicts with static framework linking)
        if (!podfile.includes("Disable prebuilt RN")) {
          podfile = podfile.replace(
            /^(platform :ios.*)$/m,
            `# Disable prebuilt RN for static framework compatibility with RNFB\nENV['RCT_USE_RN_DEP'] = '0'\nENV['RCT_USE_PREBUILT_RNCORE'] = '0'\n$1`
          );
        }

        // Add use_frameworks! :linkage => :static before prepare_react_native_project!
        if (!podfile.includes("use_frameworks! :linkage => :static")) {
          podfile = podfile.replace(
            /(prepare_react_native_project!\n)/,
            `use_frameworks! :linkage => :static\n\n$1`
          );
        }

        // Inject post_install fixes
        if (!podfile.includes("RNFB post_install fix")) {
          const postInstallCode = `
    # RNFB post_install fix
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
      end
    end
`;
          podfile = podfile.replace(
            /(post_install do \|installer\|\n)/,
            `$1${postInstallCode}\n`
          );
        }

        fs.writeFileSync(podfilePath, podfile, "utf8");
      }

      // Patch RNFBFirestore/RNFBStorage headers to add missing React import
      // (known issue: https://github.com/invertase/react-native-firebase/issues/8988)
      const rnfbModules = ["firestore", "storage"];
      for (const mod of rnfbModules) {
        const iosDir = path.join(
          projectRoot,
          "node_modules",
          `@react-native-firebase/${mod}`,
          "ios",
          `RNFB${mod.charAt(0).toUpperCase() + mod.slice(1)}`
        );
        if (fs.existsSync(iosDir)) {
          const files = fs.readdirSync(iosDir);
          for (const file of files) {
            if (file.endsWith(".h") || file.endsWith(".m")) {
              const filePath = path.join(iosDir, file);
              let content = fs.readFileSync(filePath, "utf8");
              if (
                content.includes("RCTPromiseRejectBlock") &&
                !content.includes("#import <React/RCTBridgeModule.h>")
              ) {
                content = `#import <React/RCTBridgeModule.h>\n${content}`;
                fs.writeFileSync(filePath, content, "utf8");
              }
            }
          }
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
