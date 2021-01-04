import {
    createAuctionContract,
    createAuctionFactoryContract,
    getJson,
} from "./utils.js";

const ELEMS = {
    LIST: document.getElementById("list"),
};

const AuctionList = {
    web3provider: null,

    setWeb3(web3provider) {
        AuctionList.web3provider = web3provider;
    },

    onLoad() {
        AuctionList.listAuctions(AuctionList.web3provider);
    },

    onSubmit() {},

    async listAuctions(web3provider) {
        ELEMS.LIST.innerText = "";

        AuctionList.web3provider = web3provider;
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
        const auctionInfo = await AuctionList.getAuctionInfo(address);
        const elem = document.createElement("li");
        elem.innerHTML = `<div>
            <h4>Address: ${address}</h4>
            <div>Phase two from ${auctionInfo.phaseTwoStart.toLocaleString()} 
            to ${auctionInfo.phaseThreeStart.toLocaleString()}</div>
            <h5> Description: </h5>
            <div> ${auctionInfo.description} </div>
        </div>`;
        ELEMS.LIST.appendChild(elem);
        console.log(address, auctionInfo);
    },

    async getAuctionInfo(address) {
        const contract = await createAuctionContract(
            AuctionList.web3provider,
            address
        );
        console.log("asdf", contract);
        return {
            phaseTwoStart: new Date(
                (await contract.phaseTwoStart.call()).toNumber()
            ),
            phaseThreeStart: new Date(
                (await contract.phaseThreeStart.call()).toNumber()
            ),
            description: await contract.description.call(),
        };
    },
};

export default AuctionList;
