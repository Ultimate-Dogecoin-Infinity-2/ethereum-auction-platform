// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;


contract Auction {
    address payable owner;
    string public description;

    uint public startingPrice;

    uint256 public phaseTwoStart;
    uint256 public phaseThreeStart;

    // Mapping to frozen ether
    mapping(bytes32 => uint) public bids;

    struct Bid {
        uint revealedWeis;
        uint biddedPrice;
    }

    struct BidReveal {
        address payable bidder;
        uint biddedPrice;
        uint salt;
    }


    mapping(address => Bid) public revealedBids;

    constructor(uint _phaseTwoStart, uint _phaseThreeStart, string memory _description, uint _startingPrice, address payable _owner) {
        phaseTwoStart = _phaseTwoStart;
        phaseThreeStart = _phaseThreeStart;
        description = _description;
        startingPrice = _startingPrice;
        owner = _owner;
    }

    modifier onlyInPhaseOne {
        require(block.timestamp < phaseTwoStart, "This action is only avalible in phase one");
        _;
    }

    modifier onlyInPhaseTwo {
        require(block.timestamp >= phaseTwoStart && block.timestamp < phaseThreeStart, 
            "This action is only avalible in phase two");
        _;
    }

    modifier onlyInPhaseThree {
        require(block.timestamp >= phaseThreeStart, "This action is only avalible in phase three");
        _;
    }

    function placeBids(bytes32 bidHash) onlyInPhaseOne public payable {
        require (msg.value > 0, "Ether provided must be greater than 0");
        require (bids[bidHash] == 0, "You cannot send the same hash twice");
        bids[bidHash] = msg.value;
    }

    function revealBids(BidReveal[] memory bidReveal) onlyInPhaseTwo public {
        for (uint i = 0; i < bidReveal.length; i++) {
            BidReveal memory bid = bidReveal[i];

            require(bid.biddedPrice > 0, "Bidded sum must be greater than 0");

            if (revealedBids[bid.bidder].biddedPrice == 0) {
                revealedBids[bid.bidder].biddedPrice = bid.biddedPrice;
            }
            else {
                require(revealedBids[bid.bidder].biddedPrice == bid.biddedPrice, "Bidded sum cannot be changed");
            }

            uint weisRelatedToHash = bids[keccak256(abi.encode(bid.bidder, bid.biddedPrice, bid.salt))];

            revealedBids[bid.bidder].revealedWeis += weisRelatedToHash;
        }
    }

    function withdraw(address payable[] memory withdrawalAddress) onlyInPhaseThree public {
        // TODO: Implement
    }
}
