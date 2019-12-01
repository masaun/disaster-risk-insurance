pragma solidity 0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./storage/DrStorage.sol";
import "./storage/DrConstants.sol";


contract DisasterAreaRegistry is Ownable, DrStorage, DrConstants {

    constructor() public Ownable() {}

    function createDisasterArea(string _cityName, bool _isDisaster) public {
        DisasterArea memory area = DisasterArea({
            cityName: _cityName,
            isDisaster: _isDisaster
        });
        areas.push(area);

        emit CreateDisasterArea (
            area.cityName,
            area.isDisaster
        );
    }
}
