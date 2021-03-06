// SPDX-License-Identifier: GPL-3.0-or-later
import AuctionCreation from "./AuctionCreation.js";
import AuctionList from "./AuctionList.js";
import AuctionCommit from "./AuctionCommit.js";
import AuctionReveal from "./AuctionReveal.js";
import AuctionWithdrawal from "./AuctionWithdrawal.js";

const ELEMS = {
    ACCOUNT: document.getElementById("account"),
    MAIN: document.getElementById("main"),
    LOADING: document.getElementById("loading"),
};
const ROUTER = {
    "/": { onLoad() {}, onSubmit() {}, setWeb3() {} },
    "/auction_creation.html": AuctionCreation,
    "/auction_listing.html": AuctionList,
    "/auction_commiting.html": AuctionCommit,
    "/auction_revealing.html": AuctionReveal,
    "/auction_withdrawing.html": AuctionWithdrawal,
};

const App = {
    account: "",
    web3provider: null,
    pathObject: null,

    load: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.render();
    },

    async loadWeb3() {
        App.web3provider = ethereum;
        window.web3 = new Web3(App.web3provider);
        try {
            // Request account access if needed
            await ethereum.request({ method: "eth_requestAccounts" });
            // Acccounts now exposed
            web3.eth.sendTransaction({
                /* ... */
            });
        } catch (error) {
            // User denied account access...
        }
    },

    async onSubmit() {
        App.pathObject.onSubmit();
    },

    async passClick(...args) {
        App.pathObject.passClick(...args);
    },

    async loadAccount() {
        App.account = (await web3.eth.getAccounts())[0];
    },

    async render() {
        ELEMS.ACCOUNT.textContent = App.account;
        App.pathObject = ROUTER[window.location.pathname];
        App.pathObject.setWeb3(App.web3provider, App.account);

        ELEMS.MAIN.hidden = false;
        ELEMS.LOADING.hidden = true;

        App.pathObject.onLoad();
    },
};

(() => {
    window.onload = () => {
        window.App = App;
        App.load();
    };
})();
