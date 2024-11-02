const ElectioneerFactory = artifacts.require("ElectioneerFactory");

module.exports = function (deployer) {
  deployer.deploy(ElectioneerFactory);
};
