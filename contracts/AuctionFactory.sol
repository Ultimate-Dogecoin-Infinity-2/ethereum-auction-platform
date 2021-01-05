// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {Auction} from "./Auction.sol";


contract AuctionFactory {
    address[] public auctions;

    event AuctionCreated(
        address auctionContract,
        address owner,
        uint256 numAuctions,
        address[] allAuctions
    );

    function createAuction(
        uint256 _phaseTwoStart,
        uint256 _phaseThreeStart,
        string memory _description,
        uint256 _startingPrice,
        address payable owner
    ) public {}
}
