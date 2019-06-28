var Airdroplet = artifacts.require("./Airdroplet.sol");

module.exports = function(deployer) {
  deployer.deploy(Airdroplet);
};
