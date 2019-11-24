const FlightDelayInsurance = artifacts.require("FlightDelayInsurance");
const LinkTokenInterface = artifacts.require("LinkTokenInterface");

const linkTokenAddress = "0x20fE562d797A42Dcb3399062AE9546cd06f63280";
const oracle = "0x4a3fbbb385b5efeb4bc84a25aaadcd644bd09721";
const jobId = web3.utils.toHex("330fd719ba2e498aadcf996fa4515f59");  // Aviation Edge - Flight schedules API
const paymentAmount = web3.utils.toWei("0.1");

module.exports = async function (deployer) {
    await deployer.deploy(FlightDelayInsurance, linkTokenAddress, oracle, jobId, paymentAmount);
    const flightDelayInsurance = await FlightDelayInsurance.deployed();

    const linkToken = await LinkTokenInterface.at(linkTokenAddress);
    await linkToken.transfer(flightDelayInsurance.address, paymentAmount);
};