pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./storage/DrStorage.sol";
import "./storage/DrConstants.sol";


contract Beneficiary is Ownable, DrStorage, DrConstants {

    constructor() public Ownable() {}

    function beneficiaryRegistry() public {}
}
