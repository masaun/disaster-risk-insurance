pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./storage/DrStorage.sol";
import "./storage/DrConstants.sol";


contract Beneficiary is Ownable, DrStorage, DrConstants {

    constructor() public {}

    function beneficiaryRegistry(
        address _walletAddr,      // Wallet address for funding and withdrawing 
        uint _fundAmount,   // Total fund amount of insurance
        string _ipAddress,  // IP adress of beneficiary
        bool _isDisaster   // Whether beneficiary live around areas of disaster or not
    ) public {
        Beneficiary memory beneficiary = new Beneficiary({
            walletAddr: _walletAddr,
            fundAmount: _fundAmount,
            ipAddress: _ipAddress,
            isDisaster: _isDisaster
        });
        beneficiaries.push(beneficiary);

    }
}
