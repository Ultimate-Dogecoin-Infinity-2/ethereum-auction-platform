// SPDX-License-Identifier: GPL-3.0-or-later
import { createAuctionContract } from "./utils.js";

const ELEMS = {
    AUCTION_ADDRESS: document.getElementById("auctionAddress"),
    BIDDER_ADDRESS: "bidderAddress",
    PLACED_BID: "placedBid",
    PLACED_BID_UNIT: "placedBidUnit",
    SALT: "salt",
    ID: "id",
    TEMPLATE: document.getElementById("template"),
};

const AuctionReveal = {
    contract: null,
    web3provider: null,
    account: null,
    template: null,

    setWeb3(web3provider, account) {
        AuctionReveal.web3provider = web3provider;
        AuctionReveal.account = account;
    },

    onLoad() {
        AuctionReveal.template = ELEMS.TEMPLATE.cloneNode(true);
    },

    onSubmit() {
        const params = AuctionReveal.getParams();
        AuctionReveal.callContract(
            AuctionReveal.web3provider,
            AuctionReveal.account,
            params
        );
    },

    passClick() {
        AuctionReveal.addBid();
    },

    addBid() {
        ELEMS.TEMPLATE.parentElement.appendChild(
            AuctionReveal.template.cloneNode(true)
        );
    },

    async callContract(web3provider, account, params) {
        AuctionReveal.contract = await createAuctionContract(
            web3provider,
            params.auctionAddress,
            account
        );
        try {
            await AuctionReveal.contract.revealBids(
                params.bids.map((bid) => ({
                    bidSecretId: web3.utils.soliditySha3(bid.id),
                    returnAddress: bid.bidderAddress,
                    biddedPrice: web3.utils.toWei(
                        bid.placedBid.value,
                        bid.placedBid.unit
                    ),
                    salt: web3.utils.soliditySha3(bid.salt),
                }))
            );
        } catch (e) {
            console.error(e);
        }
    },

    getParams() {
        if (!(ELEMS.AUCTION_ADDRESS instanceof HTMLInputElement)) {
            throw "error";
        }
        const bidders = Array.from(
            document.getElementsByClassName(ELEMS.BIDDER_ADDRESS)
        );
        const bids = Array.from(
            document.getElementsByClassName(ELEMS.PLACED_BID)
        );
        const units = Array.from(
            document.getElementsByClassName(ELEMS.PLACED_BID_UNIT)
        );
        const ids = Array.from(document.getElementsByClassName(ELEMS.ID));

        const salts = Array.from(document.getElementsByClassName(ELEMS.SALT));
        return {
            auctionAddress: ELEMS.AUCTION_ADDRESS.value,
            bids: bidders.map((bidder, index) => {
                const [id, bid, unit, salt] = [
                    ids[index],
                    bids[index],
                    units[index],
                    salts[index],
                ];
                if (
                    !(bidder instanceof HTMLInputElement) ||
                    !(bid instanceof HTMLInputElement) ||
                    !(unit instanceof HTMLSelectElement) ||
                    !(salt instanceof HTMLInputElement) ||
                    !(id instanceof HTMLInputElement) ||
                    false
                ) {
                    throw "error";
                }
                return {
                    id: id.value,
                    bidderAddress: bidder.value,
                    placedBid: { value: String(bid.value), unit: unit.value },
                    salt: salt.value,
                };
            }),
        };
    },
};

export default AuctionReveal;
