pragma solidity ^0.4.24;


contract DrObjects {

	// Beneficiaries of Insurance
	struct Beneficiary {
		address walletAddr;      // Wallet address for funding and withdrawing 
		uint fundAmount;   // Total fund amount of insurance
		string ipAddress;  // IP adress of beneficiary
		bool isDisaster;   // Whether beneficiary live around areas of disaster or not
	}
	

    // Whether DisasterArea or not
    struct DisasterArea {
        string ipAddress;  // IP adress of area
        bool isDisaster;   // Whether areas is happenn disaster or not
    }
    


    struct ExampleObject {
        uint exampleId;
        string exampleName;
        address exampleAddr;
    }

}
