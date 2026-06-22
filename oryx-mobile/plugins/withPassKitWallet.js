const { withEntitlementsPlist } = require("expo/config-plugins");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

/**
 * Adds Pass Type ID entitlement so the app can present PKAddPassesViewController.
 */
function withPassKitWallet(config) {
  const passTypeId =
    process.env.PASSKIT_PASS_TYPE_ID || "pass.com.kratzerandco.oryxcards";

  return withEntitlementsPlist(config, (cfg) => {
    cfg.modResults["com.apple.developer.pass-type-identifiers"] = [
      `$(TeamIdentifierPrefix)${passTypeId}`,
    ];
    return cfg;
  });
}

module.exports = withPassKitWallet;
