// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {Auction} from "./Auction.sol";
import {CloneFactory} from './CloneFactory.sol';


contract AuctionFactory is CloneFactory {
    address public implementation;
    address[] public auctions;

    event AuctionCreated(
        address auctionContract,
        address owner
    );

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createAuction(
        uint256 _phaseTwoStart,
        uint256 _phaseThreeStart,
        string memory _description,
        uint256 _startingPrice,
        address payable _owner
    ) public {
        require(_phaseTwoStart > block.timestamp, "Phase two should be in future");
        require(_phaseThreeStart > _phaseTwoStart, "Phase three should be after phase two");

        address auction = createClone(implementation);
        Auction(auction).initialize(
            _phaseTwoStart,
            _phaseThreeStart,
            _description,
            _startingPrice,
            _owner
        );
        auctions.push(auction);
        emit AuctionCreated(
            auction,
            _owner
        );
    }
}
