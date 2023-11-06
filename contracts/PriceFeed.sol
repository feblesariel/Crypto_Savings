// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceFeed {

    /*
    Network: Goerli
    ETH_USD = 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e;

    */

    address public ETH_USD = 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e;

    function get_ETH_USD_Data() external view returns (int answer, uint8 decimals) {
        return _getLatestData(ETH_USD);
    }

    function _getLatestData(address _address) internal view returns (int, uint8) {
        (,int answer,,,) = AggregatorV3Interface(_address).latestRoundData();
        uint8 decimals = AggregatorV3Interface(_address).decimals();
        return (answer, decimals);
    }

}