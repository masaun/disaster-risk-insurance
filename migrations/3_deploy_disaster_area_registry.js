const DisasterAreaRegistry = artifacts.require("DisasterAreaRegistry");


module.exports = async function (deployer) {
    await deployer.deploy(
      DisasterAreaRegistry,
    );
};
