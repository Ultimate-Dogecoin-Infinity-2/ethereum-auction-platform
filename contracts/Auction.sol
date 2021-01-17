// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

contract Auction {
    bool initialized = false;

    address payable owner;
    string public description;

    uint256 public startingPrice;

    uint256 public phaseTwoStart;
    uint256 public phaseThreeStart;

    bytes32 public firstBidder;
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
        bytes32 bidderSecretId;
        address payable returnAddress;
        uint256 biddedPrice;
        uint256 salt;
    }

    // Mapping from bidderSecretId to Bid
    mapping(bytes32 => Bid) public revealedBids;

    function initialize(
        uint256 _phaseTwoStart,
        uint256 _phaseThreeStart,
        string memory _description,
        uint256 _startingPrice,
        address payable _owner
    ) public {
        require(!initialized, 'Auction is already initialized!');
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
            initialized &&
                block.timestamp < phaseTwoStart,
            "This action is only avalible in phase one"
        );
        _;
    }

    modifier onlyInPhaseTwo {
        require(
            initialized &&
                block.timestamp >= phaseTwoStart &&
                block.timestamp < phaseThreeStart,
            "This action is only avalible in phase two"
        );
        _;
    }

    modifier onlyInPhaseThree {
        require(
            initialized &&
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

    function setNewTopBets(bytes32 bidderId) internal {
        Bid memory bid = revealedBids[bidderId];
        if (bid.biddedPrice > firstPrice) {
            secondPrice = firstPrice;
            firstPrice = bid.biddedPrice;
            firstBidder = bidderId;
        } else if (bid.biddedPrice > secondPrice) {
            secondPrice = bid.biddedPrice;
        }
    }

    function revealBids(BidReveal[] memory bidReveal) public onlyInPhaseTwo {
        for (uint256 i = 0; i < bidReveal.length; i++) {
            BidReveal memory bid = bidReveal[i];
            bytes32 bidHash =
                keccak256(
                    abi.encode(
                        bid.bidderSecretId,
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
            require(bid.biddedPrice > 0, "Bidded price must be greater than 0");

            if (revealedBids[bid.bidderSecretId].biddedPrice == 0) {
                revealedBids[bid.bidderSecretId].biddedPrice = bid.biddedPrice;
            } else {
                require(
                    revealedBids[bid.bidderSecretId].biddedPrice ==
                        bid.biddedPrice,
                    "Bidded price cannot be changed"
                );
                require(
                    revealedBids[bid.bidderSecretId].returnAddress ==
                        bid.returnAddress,
                    "Return address cannot be changed"
                );
            }

            frozenWeis[bidHash] = 0;
            revealedBids[bid.bidderSecretId].revealedWeis += weisRelatedToHash;

            if (
                isLastBetToBiddedPrice(
                    revealedBids[bid.bidderSecretId],
                    weisRelatedToHash
                )
            ) {
                setNewTopBets(bid.bidderSecretId);
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
                if (withdrawalId == firstBidder) {
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
        ownerHasWithdrawn = true;
        owner.transfer(secondPrice);
    }
}
