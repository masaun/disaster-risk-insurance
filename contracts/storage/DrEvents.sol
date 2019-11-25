pragma solidity ^0.4.24;


contract DrEvents {

    /*********
     * DisasterRiskInsurance.sol
     *********/
    event RequestResultOfDisasterRisk (
        bytes32 requestId
    );
    


    event ExampleEvent (
        bytes32 requestId,
        string exampleName,
        address exampleAddr
    );

}
