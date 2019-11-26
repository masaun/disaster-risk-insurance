const DisasterRiskInsurance = artifacts.require("DisasterRiskInsurance");
const LinkTokenInterface = artifacts.require("LinkTokenInterface");

const linkTokenAddress = "0x20fE562d797A42Dcb3399062AE9546cd06f63280";
const oracle = "0x4a3fbbb385b5efeb4bc84a25aaadcd644bd09721";
const jobId = web3.utils.toHex("d1d029a5f50c44789f19da3ec4e51e7b");    // Ipstack - IP geolocation API
const paymentAmount = web3.utils.toWei("0.1");

module.exports = async function (deployer) {
    await deployer.deploy(
      DisasterRiskInsurance, 
      linkTokenAddress, 
      oracle, 
      jobId, 
      paymentAmount
    );
    const disasterRiskInsurance = await DisasterRiskInsurance.deployed();

    const linkToken = await LinkTokenInterface.at(linkTokenAddress);
    await linkToken.transfer(disasterRiskInsurance.address, paymentAmount);
};
