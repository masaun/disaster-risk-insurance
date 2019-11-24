pragma solidity ^0.4.24;


contract DrObjects {

	// Beneficiaries of Insurance
	struct Beneficiary {
		address addr;
		uint fundAmount;   // Total Fund Amount
		string ipAddress;  // IP adress
		bool isDisaster;   // Whether beneficiary live around areas of disaster or not
	}
	


    struct ExampleObject {
        uint exampleId;
        string exampleName;
        address exampleAddr;
    }

}
