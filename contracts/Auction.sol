// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;


contract Auction {
    address payable owner;
    string public description;

    uint public startingPrice;

    uint public phaseOneStart;
    uint public phaseTwoStart;
    uint public phaseThreeStart;

    // Mapping to frozen ether
    mapping(bytes32 => uint) public bids;

    struct Bid {
        uint revealedSum;
        uint biddedSum;
    }
    mapping(address payable => Bid) public revealedBids;

    constructor(uint _phaseOneStart, uint _phaseTwoStart, uint _phaseThreeStart, string _description, uint _startingPrice, address payable owner) { }

    function placeBids(bytes32[] _bidHash) public payable { }

    struct BidReveal {
        address payable bidder;
        uint biddedSum;
        uint salt;
    }

    function revealBids(BidReveal[] bidReveal) public { }

    function withdraw(address payable[] addr) public { }
}
