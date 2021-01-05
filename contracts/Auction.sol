// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;


contract Auction {
    address payable owner;
    string public description;

    uint256 public startingPrice;

    uint256 public phaseTwoStart;
    uint256 public phaseThreeStart;

    address payable firstBidder;
    uint256 firstPrice;
    uint256 secondPrice;

    // Mapping to frozen ether
    mapping(bytes32 => uint256) public bids;

    struct Bid {
        uint256 revealedWeis;
        uint256 biddedPrice;
    }

    struct BidReveal {
        address payable bidder;
        uint256 biddedPrice;
        uint256 salt;
    }

    mapping(address => Bid) public revealedBids;

    constructor(
        uint256 _phaseTwoStart,
        uint256 _phaseThreeStart,
        string memory _description,
        uint256 _startingPrice,
        address payable _owner
    ) {
        phaseTwoStart = _phaseTwoStart;
        phaseThreeStart = _phaseThreeStart;
        description = _description;
        startingPrice = _startingPrice;
        owner = _owner;
    }

    modifier onlyInPhaseOne {
        require(
            block.timestamp < phaseTwoStart,
            "This action is only avalible in phase one"
        );
        _;
    }

    modifier onlyInPhaseTwo {
        require(
            block.timestamp >= phaseTwoStart &&
                block.timestamp < phaseThreeStart,
            "This action is only avalible in phase two"
        );
        _;
    }

    modifier onlyInPhaseThree {
        require(
            block.timestamp >= phaseThreeStart,
            "This action is only avalible in phase three"
        );
        _;
    }

    function placeBid(bytes32 bidHash) public payable onlyInPhaseOne {
        require(msg.value > 0, "Ether provided must be greater than 0");
        require(bids[bidHash] == 0, "You cannot send the same hash twice");
        bids[bidHash] = msg.value;
    }

    function revealBids(BidReveal[] memory bidReveal) public onlyInPhaseTwo {
        for (uint256 i = 0; i < bidReveal.length; i++) {
            BidReveal memory bid = bidReveal[i];
            bytes32 bidHash = keccak256(abi.encode(bid.bidder, bid.biddedPrice, bid.salt));
            uint256 weisRelatedToHash = bids[bidHash];

            require(weisRelatedToHash > 0, "You cannot reveal the same hash twice");
            require(bid.biddedPrice > 0, "Bidded price must be greater than 0");

            if (revealedBids[bid.bidder].biddedPrice == 0) {
                revealedBids[bid.bidder].biddedPrice = bid.biddedPrice;
            } else {
                require(
                    revealedBids[bid.bidder].biddedPrice == bid.biddedPrice,
                    "Bidded price cannot be changed"
                );
            }

            bids[bidHash] = 0;
            revealedBids[bid.bidder].revealedWeis += weisRelatedToHash;

            uint256 price = revealedBids[bid.bidder].biddedPrice;
            uint256 weis = revealedBids[bid.bidder].revealedWeis;
            if (weis >= price && weis - weisRelatedToHash < price) {
                if (price > firstPrice) {
                    secondPrice = firstPrice;
                    firstPrice = price;
                    firstBidder = bid.bidder;
                } else if (price > secondPrice) {
                    secondPrice = price;
                }
            }
        }
    }

    function withdraw(address payable[] memory withdrawalAddress)
        public
        onlyInPhaseThree
    {
        // TODO: Implement
    }
}
