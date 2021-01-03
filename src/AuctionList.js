import { createAuctionFactoryContract, getJson } from "./utils.js";

const ELEMS = {
    LIST: document.getElementById("list"),
};

const AuctionList = {
    async listAuctions(web3provider) {
        const factoryContract = await createAuctionFactoryContract(
            web3provider
        );

        try {
            for (let i = 0; ; i++) {
                AuctionList.addAuctionToList(
                    await factoryContract.auctions.call(i)
                );
            }
        } catch (e) {}
    },

    async addAuctionToList(address) {
        const elem = document.createElement("li");
        elem.innerText = address;
        ELEMS.LIST.appendChild(elem);
    },
};

export default AuctionList;
