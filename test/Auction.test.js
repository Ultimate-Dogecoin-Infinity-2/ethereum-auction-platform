const AuctionFactory = artifacts.require("./AuctionFactory.sol");
const Auction = artifacts.require("./Auction.sol")

const bids = {
    wojtek: [{
        id: web3.utils.asciiToHex("random"),
        bidderAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        placedBid: {
            value: "2",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }, {
        id: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0",
        bidderAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        placedBid: {
            value: "4",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }, {
        id: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0",
        bidderAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        placedBid: {
            value: "8",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }], 


    maucin: [{
        id: "59c2cc2a4eeca3572f88bd729e4eab544c17be2b0a85f36ca94dcfeba3ce123c38a5080530b4a6863fdc4af0b03831356b8d07de8bf5e61e0aede1eda6a46846",
        bidderAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        placedBid: {
            value: "2",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }, {
        id: "3572f88bd729e4eab544c17be2b0a85f36ca94dcfeba3ce123c38a5080530b4a",
        returnAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        biddedPrice: {
            value: "4",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }, {
        bidderSecretId: "3572f88bd729e4eab544c17be2b0a85f36ca94dcfeba3ce123c38a5080530b4a",
        returnAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        biddedPrice: 8,
        salt: web3.utils.asciiToHex("random")
    }], 


    krzys: [{
        id: "0f4239df6e429436371954a3c653442c97be08bcb8a03fcfb48c6ad0686a22db",
        bidderAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        placedBid: {
            value: "2",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }, {
        id: "0f4239df6e429436371954a3c653442c97be08bcb8a03fcfb48c6ad0686a22db",
        bidderAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        placedBid: {
            value: "4",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }, {
        id: "0f4239df6e429436371954a3c653442c97be08bcb8a03fcfb48c6ad0686a22db",
        bidderAddress: "0x29aCFcBdA0E899076371943A84A383Ec1472aF2A",
        placedBid: {
            value: "8",
            unit: "wei"
        },
        salt: "78b3f39738755b8d77efa787e298ed953b57f49ad55f9139597676eb2eefdbd0"
    }], 
}

const computeHash = (params) => {
    return web3.utils.soliditySha3(
        web3.eth.abi.encodeParameters(
            ["bytes32", "address", "uint256", "bytes32"],
            [
                web3.utils.soliditySha3(params.id),
                params.bidderAddress,
                params.bidderPrice,
                web3.utils.soliditySha3(params.salt),
            ]
        )
    );
};

const advanceBlockAtTime = (time) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_mine",
                params: [time],
                id: new Date().getTime(),
            },
            (err, _) => {
                if (err) {
                    return reject(err);
                }
                const newBlockHash = web3.eth.getBlock("latest").hash;

                return resolve(newBlockHash);
            },
        );
    });
};


const placeBid = async (bid, value) => {
    return await this.auction.placeBid(computeHash(bid), {value: value});
}

const timeNow = Math.floor(Date.now() / 1000)


contract("AuctionFactory", (accounts) => {

    before(async () => {
        await advanceBlockAtTime(timeNow)
        this.auctionFactory = await AuctionFactory.deployed();
    });

    it("Auction factory deploys successfully", async () => {
        const address = await this.auctionFactory.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, "");
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    });

    it("Add auction", async () => {
        await this.auctionFactory.createAuction(timeNow + 1000,
            timeNow + 10000, "Sample description", 4, "0x1C1fB907b6B4aE848762495E8e98F3Ff45035A86")
        this.auction = await Auction.at(await this.auctionFactory.auctions(0));
        assert.notEqual(this.auction, undefined);
    });

    it("creates bids", async () => {
        await placeBid(bids["wojtek"][0], 20);
        try {
            await placeBid(bids["wojtek"][0], 20);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert You cannot send the same hash twice -- Reason given: You cannot send the same hash twice.")
        }

        await placeBid(bids["wojtek"][1], 100);
        await placeBid(bids["wojtek"][2], 1000);

        await placeBid(bids["maucin"][0], 10);
        await placeBid(bids["maucin"][1], 10);
    });

    it("bid without value exception", async () => {
        try {
            await placeBid(bids["wojtek"][0], 0);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Ether provided must be greater than 0 -- Reason given: Ether provided must be greater than 0.")
        }
    });

    it("phase 1 ends", async () => {
        await advanceBlockAtTime(timeNow + 2000);
    });

    it("hash send after phase 1 ended", async () => {
        try {
            await placeBid(bids["maucin"][2], 100);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert This action is only avalible in phase one -- Reason given: This action is only avalible in phase one.");
        }
    });

    // it("reveal nonexisting bet exception", async () => {
    //     try {
    //         await this.auction.revealBids([bids["maucin"][2]]);
    //         assert.fail("Exception should be thrown")
    //     }
    //     catch (e) {
    //         assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert This action is only avalible in phase one -- Reason given: This action is only avalible in phase one.");
    //     }
    // })
});