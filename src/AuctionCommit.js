import {
    createAuctionContract,
    createAuctionFactoryContract,
    getJson,
} from "./utils.js";

const ELEMS = {
    AUCTION_ADDRESS: document.getElementById("auctionAddress"),
    BIDDER_ADDRESS: document.getElementById("bidderAddress"),
    PLACED_BID: document.getElementById("placedBid"),
    PLACED_BID_UNIT: document.getElementById("placedBidUnit"),
    FROZEN_WEIS: document.getElementById("frozenWeis"),
    FROZEN_WEIS_UNIT: document.getElementById("frozenWeisUnit"),
    SALT: document.getElementById("salt"),
    ID: document.getElementById("id"),
};

const AuctionCommit = {
    contract: null,
    web3provider: null,
    account: null,

    setWeb3(web3provider, account) {
        AuctionCommit.web3provider = web3provider;
        AuctionCommit.account = account;
    },

    onLoad() {},

    onSubmit() {
        const params = AuctionCommit.getParams();
        AuctionCommit.callContract(
            AuctionCommit.web3provider,
            AuctionCommit.account,
            params
        );
    },

    async callContract(web3provider, account, params) {
        AuctionCommit.contract = await createAuctionContract(
            web3provider,
            params.auctionAddress,
            account
        );
        try {
            await AuctionCommit.contract.placeBid(
                AuctionCommit.computeHash(params),
                {
                    value: web3.utils.toWei(
                        params.frozenWeis.value,
                        params.frozenWeis.unit
                    ),
                }
            );
        } catch (e) {
            console.error(e);
        }
    },

    computeHash(params) {
        return web3.utils.soliditySha3(
            web3.eth.abi.encodeParameters(
                ["bytes32", "address", "uint256", "uint256"],
                [
                    params.id,
                    params.bidderAddress,
                    web3.utils.toWei(
                        params.placedBid.value,
                        params.placedBid.unit
                    ),
                    web3.utils.soliditySha3(params.salt),
                ]
            )
        );
    },

    getParams() {
        if (
            !(ELEMS.AUCTION_ADDRESS instanceof HTMLInputElement) ||
            !(ELEMS.BIDDER_ADDRESS instanceof HTMLInputElement) ||
            !(ELEMS.PLACED_BID instanceof HTMLInputElement) ||
            !(ELEMS.PLACED_BID_UNIT instanceof HTMLSelectElement) ||
            !(ELEMS.FROZEN_WEIS instanceof HTMLInputElement) ||
            !(ELEMS.FROZEN_WEIS_UNIT instanceof HTMLSelectElement) ||
            !(ELEMS.SALT instanceof HTMLInputElement) ||
            !(ELEMS.ID instanceof HTMLInputElement) ||
            false
        ) {
            throw "error";
        }
        return {
            auctionAddress: ELEMS.AUCTION_ADDRESS.value,
            bidderAddress: ELEMS.BIDDER_ADDRESS.value,
            placedBid: {
                value: ELEMS.PLACED_BID.value,
                unit: ELEMS.PLACED_BID_UNIT.value,
            },
            frozenWeis: {
                value: ELEMS.FROZEN_WEIS.value,
                unit: ELEMS.FROZEN_WEIS_UNIT.value,
            },
            salt: ELEMS.SALT.value,
            id: ELEMS.ID.value,
        };
    },
};

export default AuctionCommit;
