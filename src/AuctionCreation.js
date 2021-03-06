// SPDX-License-Identifier: GPL-3.0-or-later
import { createAuctionFactoryContract, getJson } from "./utils.js";

const ELEMS = {
    P2DATE: document.getElementById("p2Date"),
    P2TIME: document.getElementById("p2Time"),
    P3DATE: document.getElementById("p3Date"),
    P3TIME: document.getElementById("p3Time"),
    DESCRIPTION: document.getElementById("description"),
    START_PRICE: document.getElementById("startPrice"),
    START_PRICE_UNIT: document.getElementById("startPriceUnit"),
    OWNER: document.getElementById("owner"),
};

const AuctionCreation = {
    contract: null,
    web3provider: null,
    account: null,

    setWeb3(web3provider, account) {
        AuctionCreation.web3provider = web3provider;
        AuctionCreation.account = account;
    },

    onLoad() {},

    onSubmit() {
        AuctionCreation.createAuction(
            AuctionCreation.web3provider,
            AuctionCreation.account
        );
    },

    async createAuction(web3provider, account) {
        const params = AuctionCreation.getParams();
        AuctionCreation.contract = await createAuctionFactoryContract(
            web3provider,
            account
        );
        await AuctionCreation.callContract(params);
    },

    async callContract(params) {
        const result = await AuctionCreation.contract.createAuction(
            String(Math.floor(params.phaseTwoStart.getTime() / 1000)),
            String(Math.floor(params.phaseThreeStart.getTime() / 1000)),
            params.description,
            web3.utils.toWei(
                params.startingPrice.value,
                params.startingPrice.unit
            ),
            params.owner
        );
        console.debug(result);
    },

    getParams() {
        if (
            !(ELEMS.P2DATE instanceof HTMLInputElement) ||
            !(ELEMS.P2TIME instanceof HTMLInputElement) ||
            !(ELEMS.P3DATE instanceof HTMLInputElement) ||
            !(ELEMS.P3TIME instanceof HTMLInputElement) ||
            !(ELEMS.DESCRIPTION instanceof HTMLTextAreaElement) ||
            !(ELEMS.START_PRICE instanceof HTMLInputElement) ||
            !(ELEMS.START_PRICE_UNIT instanceof HTMLSelectElement) ||
            !(ELEMS.OWNER instanceof HTMLInputElement) ||
            false
        ) {
            throw "error";
        }
        return {
            phaseTwoStart: new Date(
                `${ELEMS.P2DATE.value} ${ELEMS.P2TIME.value}`
            ),
            phaseThreeStart: new Date(
                `${ELEMS.P3DATE.value} ${ELEMS.P3TIME.value}`
            ),
            description: ELEMS.DESCRIPTION.value,
            startingPrice: {
                value: ELEMS.START_PRICE.value,
                unit: ELEMS.START_PRICE_UNIT.value,
            },
            owner: ELEMS.OWNER.value,
        };
    },

    async loadContract(web3provider, account) {
        const json = await getJson("AuctionFactory.json");
        const contract = TruffleContract(json);
        contract.setProvider(web3provider);
        contract.defaults({
            from: account,
        });

        AuctionCreation.contract = await contract.deployed();
    },
};

export default AuctionCreation;
