const BeneficiaryRegistry = artifacts.require("BeneficiaryRegistry");


module.exports = async function (deployer) {
    await deployer.deploy(
      BeneficiaryRegistry,
    );
};
