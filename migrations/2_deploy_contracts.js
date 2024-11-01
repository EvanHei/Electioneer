const Electioneer = artifacts.require("Electioneer");

module.exports = function (deployer) {
  deployer.deploy(Electioneer);
};
