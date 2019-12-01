pragma solidity ^0.4.24;


contract DrEvents {

    /*********
     * DisasterRiskInsurance.sol
     *********/
    event RequestResultOfDisasterRisk (
        bytes32 requestId
    );
    

    /*********
     * BeneficiaryRegistry.sol
     *********/
    event CreateBeneficiary (
        address walletAddr,
        uint initialAmount,
        string ipAddress,
        bool isDisaster
    );


    /*********
     * DisasterAreaRegistry.sol
     *********/
    event CreateDisasterArea (
        string cityName,
        bool isDisaster
    );


    event ExampleEvent (
        bytes32 requestId,
        string exampleName,
        address exampleAddr
    );

}
