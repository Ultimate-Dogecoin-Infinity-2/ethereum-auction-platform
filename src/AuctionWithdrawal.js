import {
    createAuctionContract,
    createAuctionFactoryContract,
    getJson,
} from "./utils.js";

const ELEMS = {
    AUCTION_ADDRESS: document.getElementById("auctionAddress"),
    BIDDER_ADDRESS: "bidderAddress",
    PLACED_BID: "placedBid",
    PLACED_BID_UNIT: "placedBidUnit",
    SALT: "salt",
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
            params,
            false
        );
    },

    passClick(dealerWithdraw) {
        if (dealerWithdraw) {
            AuctionReveal.dealerWithdraw();
        } else {
            AuctionReveal.addBid();
        }
    },

    dealerWithdraw() {
        const params = AuctionReveal.getParams();
        AuctionReveal.callContract(
            AuctionReveal.web3provider,
            AuctionReveal.account,
            params,
            true
        );
    },

    addBid() {
        ELEMS.TEMPLATE.parentElement.appendChild(
            AuctionReveal.template.cloneNode(true)
        );
    },

    async callContract(web3provider, account, params, dealer) {
        AuctionReveal.contract = await createAuctionContract(
            web3provider,
            params.auctionAddress,
            account
        );
        try {
            if (dealer) {
                await AuctionReveal.contract.withdrawDealer();
            } else {
                await AuctionReveal.contract.withdrawBidder(params.addresses);
            }
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
        return {
            auctionAddress: ELEMS.AUCTION_ADDRESS.value,
            addresses: bidders.map((bidder) =>
                bidder instanceof HTMLInputElement ? bidder.value : ""
            ),
        };
    },
};

export default AuctionReveal;
