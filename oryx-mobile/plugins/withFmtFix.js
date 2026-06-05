const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Xcode 16+ Clang reports consteval support but then rejects certain
 * consteval usages inside the fmt 11.x pod (shipped with React Native).
 * This plugin patches the Podfile post_install to rewrite the fmt header
 * so consteval is never enabled.
 */
function withFmtFix(config) {
  return withDangerousMod(config, [
    "ios",
    (modConfig) => {
      const podfilePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfile = fs.readFileSync(podfilePath, "utf-8");

      const patch = `
    # [withFmtFix] Patch fmt header to disable consteval (Xcode 16+ compat)
    fmt_base = File.join(__dir__, 'Pods', 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      content = File.read(fmt_base)
      patched = content.gsub(
        /#  define FMT_USE_CONSTEVAL 1/,
        '#  define FMT_USE_CONSTEVAL 0  // patched by withFmtFix'
      )
      File.write(fmt_base, patched) if patched != content
    end`;

      if (!podfile.includes("withFmtFix")) {
        podfile = podfile.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${patch}`
        );
        fs.writeFileSync(podfilePath, podfile, "utf-8");
      }

      return modConfig;
    },
  ]);
}

module.exports = withFmtFix;
