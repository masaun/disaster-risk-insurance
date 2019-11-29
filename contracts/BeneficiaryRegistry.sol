pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./storage/DrStorage.sol";
import "./storage/DrConstants.sol";


contract BeneficiaryRegistry is Ownable, DrStorage, DrConstants {

    constructor() public {}

    function createBeneficiary(
        address walletAddr,   // Wallet address for funding and withdrawing
        string ipAddress      // IP adress of beneficiary
    ) public {
        uint initialAmount = 0;    // Total fund amount of insurance
        bool isDisaster = false;   // Whether beneficiary live around areas of disaster or not

        Beneficiary memory beneficiary = Beneficiary({
            walletAddr: walletAddr,
            totalFundAmount: initialAmount,
            ipAddress: ipAddress,
            isDisaster: isDisaster
        });
        beneficiaries.push(beneficiary);

    }
}
