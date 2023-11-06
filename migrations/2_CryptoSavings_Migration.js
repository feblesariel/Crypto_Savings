const CryptoSavings = artifacts.require("CryptoSavings");

module.exports = function (deployer) {
  deployer.deploy(CryptoSavings);
};