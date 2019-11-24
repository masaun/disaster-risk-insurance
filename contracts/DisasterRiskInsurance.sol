pragma solidity 0.4.24;

import "../node_modules/chainlink/contracts/ChainlinkClient.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract DisasterRiskInsurance is ChainlinkClient, Ownable {
    mapping(address => uint256) private fundTrue;
    mapping(address => uint256) private fundFalse;
    uint256 public totalFundTrue;
    uint256 public totalFundFalse;

    uint256 private oraclePaymentAmount;
    bytes32 private jobId;

    bool public resultReceived;
    bool public result;

    constructor(
        address _link,
        address _oracle,
        bytes32 _jobId,
        uint256 _oraclePaymentAmount
        )
    Ownable()
    public
    {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        oraclePaymentAmount = _oraclePaymentAmount;
    }

    function fundInsurance(bool fundOutcome) external payable
    {
        require(!resultReceived, "You cannot fund after the result has been received.");
        if (fundOutcome)
        {
            fundTrue[msg.sender] += msg.value;
            totalFundTrue += msg.value;
        }
        else
        {
            fundFalse[msg.sender] += msg.value;
            totalFundFalse += msg.value;
        }
    }

    function withdraw() external
    {
        require(resultReceived, "You cannot withdraw before the result has been received.");
        if (result)
        {
            msg.sender.transfer(((totalFundTrue + totalFundFalse) * fundTrue[msg.sender]) / totalFundTrue);
            fundTrue[msg.sender] = 0;
        }
        else
        {
            msg.sender.transfer(((totalFundTrue + totalFundFalse) * fundFalse[msg.sender]) / totalFundFalse);
            fundFalse[msg.sender] = 0;
        }
    }

    // You probably do not want onlyOwner here
    // But then, you need some mechanism to prevent people from spamming this
    function requestResultOfDisasterRisk() external returns (bytes32 requestId)    // Without onlyOwner
    //function requestResult() external onlyOwner returns (bytes32 requestId)
    {
        require(!resultReceived, "The result has already been received.");
        Chainlink.Request memory req = buildChainlinkRequest(jobId, this, this.fulfill.selector);
        // Using Ipstack - IP geolocation API
        req.add("ip", "194.199.104.14");
        req.add("copyPath", "connection.isp");
        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), req, oraclePaymentAmount);
    }

    function getFundAmount(bool outcome) external view returns (uint256 fundAmount)
    {
        if (outcome)
        {
            fundAmount = fundTrue[msg.sender];
        }
        else
        {
            fundAmount = fundFalse[msg.sender];
        }
    }

    function fulfill(bytes32 _requestId, int256 data)
    public
    recordChainlinkFulfillment(_requestId)
    {
        resultReceived = true;
        if (data == 6)
        {
            result = true;
        }
        else
        {
            result = false;
        }
    }
}
