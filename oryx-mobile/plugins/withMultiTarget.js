/**
 * Expo config plugin: Multi-target iOS setup
 * Adds Dev and Staging build configurations and schemes so you can
 * build/archive each app variant without manually changing Xcode settings.
 *
 * - Oryx (Prod): com.oryxjuanita.app
 * - Oryx Dev: com.oryxjuanita.app.dev
 * - Oryx Staging: com.oryxjuanita.app.staging
 */

const fs = require("fs");
const path = require("path");
const xcode = require("xcode");
const { withFinalizedMod } = require("@expo/config-plugins");

const PROJECT_NAME = "OryxAppleWalletCards";
const MAIN_GROUP = "OryxAppleWalletCards";

const VARIANTS = [
  {
    id: "dev",
    suffix: "Dev",
    bundleId: "com.oryxjuanita.app.dev",
    displayName: "Oryx Dev",
    productName: "OryxAppleWalletCards",
  },
  {
    id: "staging",
    suffix: "Staging",
    bundleId: "com.oryxjuanita.app.staging",
    displayName: "Oryx Staging",
    productName: "OryxAppleWalletCards",
  },
];

function generateUuid() {
  return "xxxxxxxxxxxxxxxxxxxxxxxx".replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

function withMultiTarget(config, { appleTeamId } = {}) {
  return withFinalizedMod(config, [
    "ios",
    async (config) => {
      const { nextMod } = config.modRequest;
      const projectRoot = config.modRequest.projectRoot;
      const iosPath = path.join(projectRoot, "ios");
      const projectPath = path.join(
        iosPath,
        `${PROJECT_NAME}.xcodeproj`,
        "project.pbxproj"
      );

      const result = typeof nextMod === "function" ? await nextMod(config) : config;

      if (!fs.existsSync(projectPath)) {
        console.warn(
          "[withMultiTarget] ios project not found. Skipping multi-target setup."
        );
        return result;
      }

      const project = xcode.project(projectPath);
      project.parseSync();

      // 1. Create variant-specific files (Info.plist, entitlements, AppIcon)
      for (const v of VARIANTS) {
        createVariantFiles(iosPath, v);
      }

      // 2. Add build configurations and schemes
      addBuildConfigurations(project, appleTeamId);
      addSchemes(iosPath);

      // Firebase skipped - app uses Supabase, not Firebase

      fs.writeFileSync(projectPath, project.writeSync());

      return result;
    },
  ]);
}

function createVariantFiles(iosPath, variant) {
  const appDir = path.join(iosPath, PROJECT_NAME);

  // Info-Dev.plist / Info-Staging.plist
  const baseInfoPath = path.join(appDir, "Info.plist");
  const baseInfo = fs.readFileSync(baseInfoPath, "utf8");
  const variantInfo = baseInfo.replace(
    /<key>CFBundleDisplayName<\/key>\s*<string>[^<]*<\/string>/,
    `<key>CFBundleDisplayName</key>\n    <string>${variant.displayName}</string>`
  );
  const variantInfoPath = path.join(appDir, `Info-${variant.suffix}.plist`);
  fs.writeFileSync(variantInfoPath, variantInfo);

  // Entitlements
  const baseEntitlementsPath = path.join(
    appDir,
    `${PROJECT_NAME}.entitlements`
  );
  const baseEntitlements = fs.existsSync(baseEntitlementsPath)
    ? fs.readFileSync(baseEntitlementsPath, "utf8")
    : '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict/></plist>';
  const variantEntitlementsPath = path.join(
    appDir,
    `${PROJECT_NAME}-${variant.suffix}.entitlements`
  );
  fs.writeFileSync(variantEntitlementsPath, baseEntitlements);

  // AppIcon-Dev.appiconset / AppIcon-Staging.appiconset
  const baseIconDir = path.join(appDir, "Images.xcassets", "AppIcon.appiconset");
  const variantIconDir = path.join(
    appDir,
    "Images.xcassets",
    `AppIcon-${variant.suffix}.appiconset`
  );
  if (fs.existsSync(baseIconDir)) {
    fs.mkdirSync(variantIconDir, { recursive: true });
    const contentsPath = path.join(baseIconDir, "Contents.json");
    if (fs.existsSync(contentsPath)) {
      fs.copyFileSync(
        contentsPath,
        path.join(variantIconDir, "Contents.json")
      );
    }
    const files = fs.readdirSync(baseIconDir);
    for (const f of files) {
      if (f !== "Contents.json") {
        fs.copyFileSync(
          path.join(baseIconDir, f),
          path.join(variantIconDir, f)
        );
      }
    }
  }
}

function addBuildConfigurations(project, appleTeamId) {
  const buildConfigSection = project.pbxXCBuildConfigurationSection();
  const configListSection = project.pbxXCConfigurationList();
  const targetConfigListId = "13B07F931A680F5B00A75B9A";
  const projectConfigListId = "83CBB9FA1A601CBA00E9B192";

  // Base configs to copy (target Debug/Release)
  const baseDebug = buildConfigSection["13B07F941A680F5B00A75B9A"];
  const baseRelease = buildConfigSection["13B07F951A680F5B00A75B9A"];

  // Set DEVELOPMENT_TEAM on Prod configs if provided (automatic signing)
  if (appleTeamId && baseDebug && baseRelease) {
    baseDebug.buildSettings.DEVELOPMENT_TEAM = appleTeamId;
    baseRelease.buildSettings.DEVELOPMENT_TEAM = appleTeamId;
  }
  const baseProjDebug = buildConfigSection["83CBBA201A601CBA00E9B192"];
  const baseProjRelease = buildConfigSection["83CBBA211A601CBA00E9B192"];

  for (const v of VARIANTS) {
    const debugId = project.generateUuid();
    const releaseId = project.generateUuid();
    const projDebugId = project.generateUuid();
    const projReleaseId = project.generateUuid();

    // Target: Debug-Dev / Debug-Staging
    const newDebug = JSON.parse(JSON.stringify(baseDebug));
    newDebug.name = `Debug-${v.suffix}`;
    newDebug.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = v.bundleId;
    newDebug.buildSettings.PRODUCT_NAME = v.productName;
    newDebug.buildSettings.INFOPLIST_FILE = `${PROJECT_NAME}/Info-${v.suffix}.plist`;
    newDebug.buildSettings.CODE_SIGN_ENTITLEMENTS = `${PROJECT_NAME}/${PROJECT_NAME}-${v.suffix}.entitlements`;
    newDebug.buildSettings.ASSETCATALOG_COMPILER_APPICON_NAME = `AppIcon-${v.suffix}`;
    if (appleTeamId) {
      newDebug.buildSettings.DEVELOPMENT_TEAM = appleTeamId;
    }
    buildConfigSection[debugId] = newDebug;

    // Target: Release-Dev / Release-Staging
    const newRelease = JSON.parse(JSON.stringify(baseRelease));
    newRelease.name = `Release-${v.suffix}`;
    newRelease.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = v.bundleId;
    newRelease.buildSettings.PRODUCT_NAME = v.productName;
    newRelease.buildSettings.INFOPLIST_FILE = `${PROJECT_NAME}/Info-${v.suffix}.plist`;
    newRelease.buildSettings.CODE_SIGN_ENTITLEMENTS = `${PROJECT_NAME}/${PROJECT_NAME}-${v.suffix}.entitlements`;
    newRelease.buildSettings.ASSETCATALOG_COMPILER_APPICON_NAME = `AppIcon-${v.suffix}`;
    if (appleTeamId) {
      newRelease.buildSettings.DEVELOPMENT_TEAM = appleTeamId;
    }
    buildConfigSection[releaseId] = newRelease;

    // Project: Debug-Dev / Release-Dev
    const newProjDebug = JSON.parse(JSON.stringify(baseProjDebug));
    newProjDebug.name = `Debug-${v.suffix}`;
    if (appleTeamId) {
      newProjDebug.buildSettings.DEVELOPMENT_TEAM = appleTeamId;
    }
    buildConfigSection[projDebugId] = newProjDebug;

    const newProjRelease = JSON.parse(JSON.stringify(baseProjRelease));
    newProjRelease.name = `Release-${v.suffix}`;
    if (appleTeamId) {
      newProjRelease.buildSettings.DEVELOPMENT_TEAM = appleTeamId;
    }
    buildConfigSection[projReleaseId] = newProjRelease;

    // Append to configuration lists
    const targetList = configListSection[targetConfigListId];
    targetList.buildConfigurations.push({ value: debugId, comment: `Debug-${v.suffix}` });
    targetList.buildConfigurations.push({ value: releaseId, comment: `Release-${v.suffix}` });

    const projList = configListSection[projectConfigListId];
    projList.buildConfigurations.push({ value: projDebugId, comment: `Debug-${v.suffix}` });
    projList.buildConfigurations.push({ value: projReleaseId, comment: `Release-${v.suffix}` });
  }
}

function addSchemes(iosPath) {
  const schemesDir = path.join(
    iosPath,
    `${PROJECT_NAME}.xcodeproj`,
    "xcshareddata",
    "xcschemes"
  );
  fs.mkdirSync(schemesDir, { recursive: true });

  const baseScheme = `<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1130"
   version = "1.3">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
               BuildableName = "OryxAppleWalletCards.app"
               BlueprintName = "OryxAppleWalletCards"
               ReferencedContainer = "container:${PROJECT_NAME}.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <LaunchAction
      buildConfiguration = "BUILD_CONFIG"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      allowLocationSimulation = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "OryxAppleWalletCards.app"
            BlueprintName = "OryxAppleWalletCards"
            ReferencedContainer = "container:${PROJECT_NAME}.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction
      buildConfiguration = "RELEASE_CONFIG"
      shouldUseLaunchSchemeArgsEnv = "YES"
      savedToolIdentifier = ""
      useCustomWorkingDirectory = "NO"
      debugDocumentVersioning = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "OryxAppleWalletCards.app"
            BlueprintName = "OryxAppleWalletCards"
            ReferencedContainer = "container:${PROJECT_NAME}.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction
      buildConfiguration = "BUILD_CONFIG">
   </AnalyzeAction>
   <ArchiveAction
      buildConfiguration = "RELEASE_CONFIG"
      revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>`;

  for (const v of VARIANTS) {
    const content = baseScheme
      .replace(/\$\{PROJECT_NAME\}/g, PROJECT_NAME)
      .replace(/BUILD_CONFIG/g, `Debug-${v.suffix}`)
      .replace(/RELEASE_CONFIG/g, `Release-${v.suffix}`);
    fs.writeFileSync(
      path.join(schemesDir, `Oryx ${v.suffix}.xcscheme`),
      content
    );
  }
}

function createFirebasePlaceholders(iosPath) {
  const appDir = path.join(iosPath, PROJECT_NAME);
  const placeholder = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CLIENT_ID</key>
  <string>REPLACE_WITH_YOUR_FIREBASE_CLIENT_ID</string>
  <key>REVERSED_CLIENT_ID</key>
  <string>com.googleusercontent.apps.REPLACE</string>
  <key>API_KEY</key>
  <string>REPLACE_WITH_YOUR_FIREBASE_API_KEY</string>
  <key>GCM_SENDER_ID</key>
  <string>REPLACE_WITH_YOUR_GCM_SENDER_ID</string>
  <key>PLIST_VERSION</key>
  <string>1</string>
  <key>BUNDLE_ID</key>
  <string>REPLACE_WITH_BUNDLE_ID</string>
  <key>PROJECT_ID</key>
  <string>REPLACE_WITH_YOUR_PROJECT_ID</string>
  <key>STORAGE_BUCKET</key>
  <string>REPLACE_WITH_YOUR_STORAGE_BUCKET</string>
  <key>IS_ADS_ENABLED</key>
  <false/>
  <key>IS_ANALYTICS_ENABLED</key>
  <false/>
  <key>IS_APPINVITE_ENABLED</key>
  <true/>
  <key>IS_GCM_ENABLED</key>
  <true/>
  <key>IS_SIGNIN_ENABLED</key>
  <true/>
</dict>
</plist>`;

  for (const v of VARIANTS) {
    const dest = path.join(appDir, `GoogleService-Info-${v.suffix}.plist`);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, placeholder.replace("REPLACE_WITH_BUNDLE_ID", v.bundleId));
    }
  }

  // Placeholders created above; replace with real Firebase plists from Firebase Console.
}

function addFirebaseCopyScript(project) {
  // Use string concatenation (not template literals) so ${CONFIGURATION} is not evaluated by Node
  const script =
    '# Copy correct GoogleService-Info.plist per build configuration\n' +
    'if [ "${CONFIGURATION}" = "Debug-Dev" ] || [ "${CONFIGURATION}" = "Release-Dev" ]; then\n' +
    '  cp "${SRCROOT}/' +
    PROJECT_NAME +
    '/GoogleService-Info-Dev.plist" "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"\n' +
    'elif [ "${CONFIGURATION}" = "Debug-Staging" ] || [ "${CONFIGURATION}" = "Release-Staging" ]; then\n' +
    '  cp "${SRCROOT}/' +
    PROJECT_NAME +
    '/GoogleService-Info-Staging.plist" "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"\n' +
    'fi';
  const pbx = project.hash.project.objects;
  const nativeTarget = pbx.PBXNativeTarget["13B07F861A680F5B00A75B9A"];
  if (!nativeTarget || !nativeTarget.buildPhases) return;
  const scriptPhaseId = project.generateUuid();
  if (!pbx.PBXShellScriptBuildPhase) pbx.PBXShellScriptBuildPhase = {};
  pbx.PBXShellScriptBuildPhase[scriptPhaseId] = {
    isa: "PBXShellScriptBuildPhase",
    buildActionMask: 2147483647,
    files: [],
    inputPaths: [],
    name: "CopyGoogleServiceInfo",
    outputPaths: [],
    runOnlyForDeploymentPostprocessing: 0,
    shellPath: "/bin/sh",
    shellScript: script,
  };
  nativeTarget.buildPhases.push({
    value: scriptPhaseId,
    comment: "CopyGoogleServiceInfo",
  });
}

module.exports = withMultiTarget;
