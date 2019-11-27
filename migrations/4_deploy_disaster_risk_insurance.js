const DisasterRiskInsurance = artifacts.require("DisasterRiskInsurance");
const LinkTokenInterface = artifacts.require("LinkTokenInterface");

const linkTokenAddress = "0x20fE562d797A42Dcb3399062AE9546cd06f63280";
const oracle = "0x4a3fbbb385b5efeb4bc84a25aaadcd644bd09721";
/*** [Job Id] Ipstack - IP geolocation API ***/
const jobId_1 = web3.utils.toHex("d1d029a5f50c44789f19da3ec4e51e7b");    // This jobId's data-type is bytes32
const jobId_2 = web3.utils.toHex("c62efeba282f48dcb5a1d5b7b7cade9d");    // This jobId's data-type is int256
const jobId_3 = web3.utils.toHex("11a18a9089bd4c668f13f5e5df5547b8");    // This jobId's data-type is uint256

const paymentAmount = web3.utils.toWei("0.1");

module.exports = async function (deployer) {
    await deployer.deploy(
      DisasterRiskInsurance, 
      linkTokenAddress, 
      oracle, 
      jobId_1,  // This jobId's data-type is bytes32
      jobId_2,  // This jobId's data-type is int256
      jobId_3,  // This jobId's data-type is uint256
      paymentAmount
    );
    const disasterRiskInsurance = await DisasterRiskInsurance.deployed();

    const linkToken = await LinkTokenInterface.at(linkTokenAddress);
    await linkToken.transfer(disasterRiskInsurance.address, paymentAmount);
};
