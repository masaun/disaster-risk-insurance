pragma solidity 0.4.24;

import "../node_modules/chainlink/contracts/ChainlinkClient.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./storage/DrStorage.sol";
import "./storage/DrConstants.sol";


contract DisasterRiskInsurance is ChainlinkClient, Ownable, DrStorage, DrConstants {
    using SafeMath for uint256;

    mapping(address => uint256) private totalFundIndividual;
    uint256 public totalFundPool;
    uint256 RECEIVABLE_RATE;

    uint256 private oraclePaymentAmount;
    bytes32 private jobId_1;  // This jobId's data-type is bytes32
    bytes32 private jobId_2;  // This jobId's data-type is int256
    bytes32 private jobId_3;  // This jobId's data-type is uint256

    bool public resultCityReceived;     // default value is "false"
    bool public resultLatitudeReceived;    // default value is "false"
    bool public resultLongitudeReceived;   // default value is "false"
    //bool public resultReceived;          // default value is "false"

    bytes32 public resultCity;       // This is result value of request
    int256 public resultLatitude;       // This is result value of request
    int256 public resultLongitude;     // This is result value of request

    constructor(
        address _link,
        address _oracle,
        bytes32 _jobId_1,  // This jobId's data-type is bytes32
        bytes32 _jobId_2,  // This jobId's data-type is int256
        bytes32 _jobId_3,  // This jobId's data-type is uint256
        uint256 _oraclePaymentAmount
    ) Ownable() public 
    {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId_1 = _jobId_1;  // This jobId's data-type is bytes32
        jobId_2 = _jobId_2;  // This jobId's data-type is int256
        jobId_3 = _jobId_3;  // This jobId's data-type is uint256
        oraclePaymentAmount = _oraclePaymentAmount;

        RECEIVABLE_RATE = 2;   // @notice Use for calculate receivale amount
    }

    function fundInsurance(bool fundOutcome) external payable
    {
        //require(!resultReceived, "You cannot fund after the result has been received.");
        if (fundOutcome) {
            totalFundIndividual[msg.sender] += msg.value;
            totalFundPool += msg.value;
        }

    }

    function withdrawFromFundPool() external {
        //require(resultReceived, "You cannot withdraw before the result has been received.");
        require (totalFundPool >= totalFundIndividual[msg.sender], "Not enough fund pool to send insurance money");
        
        /*** 
         * @notice Each beneficially can receive 2 times amount which total amount of funding
         ***/
        msg.sender.transfer((totalFundIndividual[msg.sender] * RECEIVABLE_RATE));                        // New Logic
        //msg.sender.transfer(((totalFundPool) * totalFundIndividual[msg.sender]) / totalFundPool);    // Original Logic
        totalFundIndividual[msg.sender] = 0;
    }

    // You probably do not want onlyOwner here
    // But then, you need some mechanism to prevent people from spamming this
    function requestResultOfCity(string ipAddress) external returns (bytes32 requestId)    // Without onlyOwner
    {
        //require(!resultReceived, "The result has already been received.");

        //Chainlink.Request memory req = buildChainlinkRequest(jobId_1, this, this.fulfill.selector);
        Chainlink.Request memory req = buildChainlinkRequest(jobId_1, this, this.fulfill_city.selector);
        // Using Ipstack - IP geolocation API
        req.add("ip", ipAddress);
        //req.add("ip", "194.199.104.14");
        req.add("copyPath", "city");
        //req.add("copyPath", "location.capital");
        //req.add("copyPath", "connection.isp");

        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), req, oraclePaymentAmount);
    }

    function requestResultOfLatitude(string ipAddress) external returns (bytes32 requestId)    // Without onlyOwner
    {
        Chainlink.Request memory req = buildChainlinkRequest(jobId_2, this, this.fulfill_latitude.selector);
        // Using Ipstack - IP geolocation API
        req.add("ip", ipAddress);
        req.addInt("times", 10000000000000);  // To get number which include decimals
        req.add("copyPath", "latitude");
        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), req, oraclePaymentAmount);
    }

    function requestResultOfLongitude(string ipAddress) external returns (bytes32 requestId)    // Without onlyOwner
    {
        Chainlink.Request memory req = buildChainlinkRequest(jobId_2, this, this.fulfill_longitude.selector);
        // Using Ipstack - IP geolocation API
        req.add("ip", ipAddress);
        req.addInt("times", 1000000000000000);  // To get number which include decimals
        req.add("copyPath", "longitude");
        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), req, oraclePaymentAmount);
    }

    function getFundAmount(bool outcome) external view returns (uint256 fundAmount) 
    {
        if (outcome) {
            fundAmount = totalFundIndividual[msg.sender];
        }
        
    }


    function fulfill_city(bytes32 _requestId, bytes32 data)
    public
    recordChainlinkFulfillment(_requestId)
    {
        resultCityReceived = true;
        //resultReceived = true;

        resultCity = data;
        //result = data;
    }

    function fulfill_latitude(bytes32 _requestId, int256 data)
    public
    recordChainlinkFulfillment(_requestId)
    {
        resultLatitudeReceived = true;
        //resultReceived = true;

        resultLatitude = data;
        //result = data;
    }

    function fulfill_longitude(bytes32 _requestId, int256 data)
    public
    recordChainlinkFulfillment(_requestId)
    {
        resultLongitudeReceived = true;
        //resultReceived = true;

        resultLongitude = data;
        //result = data;
    }
}
