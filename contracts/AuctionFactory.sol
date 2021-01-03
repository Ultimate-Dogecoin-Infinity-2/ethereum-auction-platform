// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import { Auction } from './Auction.sol';

contract AuctionFactory {
    address[] public auctions;

    event AuctionCreated(address auctionContract, address owner, uint numAuctions, address[] allAuctions);

    function createAuction(uint _phaseOneStart, uint _phaseTwoStart, uint _phaseThreeStart, string memory _description, uint _startingPrice, address payable owner) public { }
}
