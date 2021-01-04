// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;


contract Auction {
    address payable owner;
    string public description;

    uint public startingPrice;

    uint public phaseTwoStart;
    uint public phaseThreeStart;

    // Mapping to frozen ether
    mapping(bytes32 => uint) public bids;

    struct Bid {
        uint revealedSum;
        uint biddedSum;
    }

    struct BidReveal {
        address payable bidder;
        uint biddedSum;
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
        require(block.number < phaseTwoStart, "This action is only avalible in phase one");
        _;
    }

    modifier onlyInPhaseTwo {
        require(block.number >= phaseTwoStart && block.number < phaseThreeStart, 
            "This action is only avalible in phase two");
        _;
    }

    modifier onlyInPhaseThree {
        require(block.number >= phaseThreeStart, "This action is only avalible in phase three");
        _;
    }

    function placeBids(bytes32[] memory bidHash) onlyInPhaseOne public payable {
        require (msg.value > 0, "Ether provided must be greater than 0");

        for (uint i = 0; i < bidHash.length; i++) {
            require (bids[bidHash[i]] == 0, "You cannot send the same hash twice");
            bids[bidHash[i]] = msg.value;
        }
    }

    function revealBids(BidReveal[] memory bidReveal) onlyInPhaseTwo public {
        for (uint i = 0; i < bidReveal.length; i++) {
            BidReveal memory bid = bidReveal[i];

            require(bid.biddedSum > 0, "Bidded sum must be greater than 0");

            if (revealedBids[bid.bidder].biddedSum == 0) {
                revealedBids[bid.bidder].biddedSum = bid.biddedSum;
            }
            else {
                require(revealedBids[bid.bidder].biddedSum == bid.biddedSum, "Bidded sum cannot be changed");
            }

            uint weisRelatedToHash = bids[keccak256(abi.encode(bid.bidder, bid.biddedSum, bid.salt))];

            revealedBids[bid.bidder].revealedSum += weisRelatedToHash;
        }
    }

    function withdraw(address payable[] memory withdrawalAddress) onlyInPhaseThree public {
        // TODO: Implement
    }
}
