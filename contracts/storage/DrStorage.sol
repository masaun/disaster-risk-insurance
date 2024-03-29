pragma solidity ^0.4.24;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./DrObjects.sol";
import "./DrEvents.sol";


// shared storage
contract DrStorage is DrObjects, DrEvents, Ownable {

    Beneficiary[] public beneficiaries;

    DisasterArea[] public areas;

    mapping (uint => ExampleObject) examples;

}

