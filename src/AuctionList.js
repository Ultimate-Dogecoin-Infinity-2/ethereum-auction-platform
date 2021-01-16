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
                AuctionList.addAuctionToList(await factoryContract.auctions(i));
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
            <div> Starting price: ${auctionInfo.startingPrice} wei </div>
            ${
                new Date() > auctionInfo.phaseThreeStart
                    ? `<div> Winner: ${auctionInfo.firstBidder} </div>
                       <div> Final price: ${auctionInfo.secondPrice} </div>`
                    : ""
            }
            <h5> Description: </h5>
            <div> ${auctionInfo.description} </div>
        </div>`;
        ELEMS.LIST.appendChild(elem);
    },

    async getAuctionInfo(address) {
        const contract = await createAuctionContract(
            AuctionList.web3provider,
            address
        );
        return {
            phaseTwoStart: new Date(
                (await contract.phaseTwoStart()).toNumber() * 1000
            ),
            phaseThreeStart: new Date(
                (await contract.phaseThreeStart()).toNumber() * 1000
            ),
            description: await contract.description(),
            startingPrice: await contract.startingPrice(),
            secondPrice: await contract.secondPrice(),
            firstBidder: await contract.revealedBids(
                await contract.firstBidder()
            ).returnAddress,
        };
    },
};

export default AuctionList;
