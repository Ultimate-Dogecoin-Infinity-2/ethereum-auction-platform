// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

contract Auction {
    bool initialized = false;

    address payable owner;
    string public description;

    uint256 public startingPrice;

    // Time given in unix timestamp
    uint256 public phaseTwoStart;
    uint256 public phaseThreeStart;

    bytes32 public firstBidId;
    uint256 firstPrice;
    uint256 public secondPrice;

    bool ownerHasWithdrawn;

    // Mapping from hash to frozen ether
    mapping(bytes32 => uint256) public frozenWeis;

    struct Bid {
        uint256 revealedWeis;
        uint256 biddedPrice;
        address payable returnAddress;
    }

    struct BidReveal {
        bytes32 bidSecretId;
        address payable returnAddress;
        uint256 biddedPrice;
        uint256 salt;
    }

    // Mapping from bidSecretId to Bid
    mapping(bytes32 => Bid) public revealedBids;

    function initialize(
        uint256 _phaseTwoStart,
        uint256 _phaseThreeStart,
        string memory _description,
        uint256 _startingPrice,
        address payable _owner
    ) public {
        require(!initialized, "Auction is already initialized");
        require(_phaseTwoStart > block.timestamp, "Phase two should be in future");
        require(_phaseThreeStart > _phaseTwoStart, "Phase three should be after phase two");

        initialized = true;
        phaseTwoStart = _phaseTwoStart;
        phaseThreeStart = _phaseThreeStart;
        description = _description;
        startingPrice = _startingPrice;
        owner = _owner;
        firstPrice = _startingPrice;
        secondPrice = _startingPrice;
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
        require(
            frozenWeis[bidHash] == 0,
            "You cannot send the same hash twice"
        );
        frozenWeis[bidHash] = msg.value;
    }

    function isLastBetToBiddedPrice(Bid memory bid, uint256 weisRelatedToHash)
        internal
        pure
        returns (bool)
    {
        return
            bid.revealedWeis >= bid.biddedPrice &&
            bid.revealedWeis - weisRelatedToHash < bid.biddedPrice;
    }

    function updateTopBids(bytes32 bidId) internal {
        Bid memory bid = revealedBids[bidId];
        if (
            bid.biddedPrice > firstPrice ||
            (bid.biddedPrice == firstPrice && firstBidId == 0)
        ) {
            secondPrice = firstPrice;
            firstPrice = bid.biddedPrice;
            firstBidId = bidId;
        } else if (bid.biddedPrice > secondPrice) {
            secondPrice = bid.biddedPrice;
        }
    }

    function revealBids(BidReveal[] memory bidReveal) public onlyInPhaseTwo {
        for (uint256 i = 0; i < bidReveal.length; i++) {
            BidReveal memory bid = bidReveal[i];

            require(bid.bidSecretId != 0, "Secret id cannot be 0");
            require(bid.biddedPrice > 0, "Bidded price must be greater than 0");

            bytes32 bidHash =
                keccak256(
                    abi.encode(
                        bid.bidSecretId,
                        bid.returnAddress,
                        bid.biddedPrice,
                        bid.salt
                    )
                );
            uint256 weisRelatedToHash = frozenWeis[bidHash];

            require(
                weisRelatedToHash > 0,
                "You cannot reveal the same hash twice or send unexisting reveal"
            );

            if (revealedBids[bid.bidSecretId].biddedPrice == 0) {
                revealedBids[bid.bidSecretId].biddedPrice = bid.biddedPrice;
                revealedBids[bid.bidSecretId].returnAddress = bid
                    .returnAddress;
            } else {
                require(
                    revealedBids[bid.bidSecretId].biddedPrice ==
                        bid.biddedPrice,
                    "Bidded price cannot be changed"
                );
                require(
                    revealedBids[bid.bidSecretId].returnAddress ==
                        bid.returnAddress,
                    "Return address cannot be changed"
                );
            }

            frozenWeis[bidHash] = 0;
            revealedBids[bid.bidSecretId].revealedWeis += weisRelatedToHash;

            if (
                isLastBetToBiddedPrice(
                    revealedBids[bid.bidSecretId],
                    weisRelatedToHash
                )
            ) {
                updateTopBids(bid.bidSecretId);
            }
        }
    }

    function withdrawBidder(bytes32[] memory withdrawalIds)
        public
        onlyInPhaseThree
    {
        for (uint256 i = 0; i < withdrawalIds.length; i++) {
            bytes32 withdrawalId = withdrawalIds[i];

            uint256 price = revealedBids[withdrawalId].biddedPrice;
            uint256 weis = revealedBids[withdrawalId].revealedWeis;
            if (price > 0 && weis >= price) {
                uint256 withdrawalWeis = weis;
                if (withdrawalId == firstBidId) {
                    withdrawalWeis -= secondPrice;
                }

                revealedBids[withdrawalId].revealedWeis = 0;
                revealedBids[withdrawalId].returnAddress.transfer(
                    withdrawalWeis
                );
            }
        }
    }

    function withdrawDealer() public onlyInPhaseThree {
        require(!ownerHasWithdrawn, "Owner cannot withdraw money twice");
        require(
            firstBidId != 0,
            "You cannot withdraw money if no one won the auction"
        );
        ownerHasWithdrawn = true;
        owner.transfer(secondPrice);
    }
}
