const AuctionFactory = artifacts.require("./AuctionFactory.sol");
const Auction = artifacts.require("./Auction.sol")

// TESTS SETUP:
// WOJTEK BIDS 3 WEI, PLACE 105, REVEAL 5
// MAUCIN BIDS 2 WEI, PLACE 10, REVEAL 10
// KRZYS BIDS 20 WEI, PLACE 4*10=40, REVEAL 4*10=40


const salt = "salt";
const returnAddress = "0xDC25EF3F5B8A186998338A2ADA83795FBA2D695E";

const bids = {
    wojtek: [{
        bidderSecretId: "wojtek",
        biddedPrice: 3,
    }, {
        bidderSecretId: "wojtek",
        biddedPrice: 4,
    }, {
        bidderSecretId: "wojtek",
        biddedPrice: 8,
    }],

    maucin: [{
        bidderSecretId: "maucin",
        biddedPrice: 2,
    }, {
        bidderSecretId: "maucin",
        biddedPrice: 4,
    }],


    krzys: [{
        bidderSecretId: "krzys",
        biddedPrice: 20,
    }],

}

const computeHash = (params, _salt=salt) => {
    return web3.utils.soliditySha3(
        web3.eth.abi.encodeParameters(
            ["bytes32", "address", "uint256", "uint256"],
            [
                web3.utils.soliditySha3(params.bidderSecretId),
                returnAddress,
                params.biddedPrice,
                web3.utils.soliditySha3(_salt),
            ]
        )
    );
};

const revealBids = async (bid, _salt=salt) => {
    params = {
        bidderSecretId: web3.utils.soliditySha3(bid.bidderSecretId),
        returnAddress: returnAddress,
        biddedPrice: bid.biddedPrice,
        salt: web3.utils.soliditySha3(_salt)
    }
    await this.auction.revealBids([params]);
}

const getCurrentBalance = async () => {
    return await web3.eth.getBalance(returnAddress);
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


const placeBid = async (bid, value, _salt=salt) => {
    return await this.auction.placeBid(computeHash(bid, _salt), { value: value });
}

const timeNow = Math.floor(Date.now() / 1000)


contract("AuctionFactory", (accounts) => {

    before(async () => {
        await advanceBlockAtTime(timeNow);
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
            timeNow + 10000, "Sample description", 0, returnAddress)
        this.auction = await Auction.at(await this.auctionFactory.auctions(0));
        assert.notEqual(this.auction, undefined);
    });

    /////////////////// PHASE ONE

    it("creates bids", async () => {
        await placeBid(bids["wojtek"][0], 5);
        try {
            await placeBid(bids["wojtek"][0], 20);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert You cannot send the same hash twice -- Reason given: You cannot send the same hash twice.")
        }

        await placeBid(bids["wojtek"][1], 100);
        await placeBid(bids["maucin"][0], 10);
        
        for (var x=0; x<4; x++) {
            await placeBid(bids["krzys"][0], 10, x);
        }
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

    it("reveal in phase 1 exception", async () => {
        try {
            await revealBids(bids["wojtek"][0]);
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert This action is only avalible in phase two -- Reason given: This action is only avalible in phase two.")
        }
    })

    it("phase 1 ends", async () => {
        await advanceBlockAtTime(timeNow + 2000);
    });


    /////////////////// PHASE TWO


    it("hash send after phase 1 ended", async () => {
        try {
            await placeBid(bids["maucin"][1], 100);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert This action is only avalible in phase one -- Reason given: This action is only avalible in phase one.");
        }
    });

    it("reveal nonexisting bet exception", async () => {
        try {
            await revealBids(bids["maucin"][1]);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert You cannot reveal the same hash twice or send unexisting reveal -- Reason given: You cannot reveal the same hash twice or send unexisting reveal.");
        }
    })

    it("reveal bids", async () => {
        await revealBids(bids["wojtek"][0]);
        try {
            await revealBids(bids["wojtek"][1]);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Bidded price cannot be changed -- Reason given: Bidded price cannot be changed.");
        }

        await revealBids(bids["maucin"][0]);
        
        for (var x=0; x<4; x++) {
            await revealBids(bids["krzys"][0], x);
        }
    })

    it ("Withdraw in phase 2 exception", async() => {
        try {
            await this.auction.withdrawBidder([web3.utils.soliditySha3("wojtek")]);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert This action is only avalible in phase three -- Reason given: This action is only avalible in phase three.");
        }
    });

    it("phase 2 ends", async () => {
        await advanceBlockAtTime(timeNow + 20000);
    });


    /////////////////// PHASE THREE

    it("Reveal bid in phase 3 exception", async () => {
        try {
            await revealBids(bids["wojtek"][2]);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert This action is only avalible in phase two -- Reason given: This action is only avalible in phase two.");
        }
    });

    it("Commit bid in phase 3 exception", async () => {
        try {
            await placeBid(bids["maucin"][1], 100);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert This action is only avalible in phase one -- Reason given: This action is only avalible in phase one.");
        }
    });

    it("Withdraw dealer", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawDealer();
        assert.equal(await getCurrentBalance() - previousBalance, 3);
    });

    it("Withdraw dealer second time exception", async () => {
        try {
            await this.auction.withdrawDealer();
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Owner cannot withdraw money twice -- Reason given: Owner cannot withdraw money twice.");
        }
    });

    it("Wojtek withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([web3.utils.soliditySha3("wojtek")]);
        assert.equal(await getCurrentBalance() - previousBalance, 5);
    });

    it("Second Wojtek withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([web3.utils.soliditySha3("wojtek")]);
        assert.equal(await getCurrentBalance() - previousBalance, 0);
    });

    it("Maucin withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([web3.utils.soliditySha3("maucin")]);
        assert.equal(await getCurrentBalance() - previousBalance, 10);
    });

    it("Krzys withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([web3.utils.soliditySha3("krzys")]);
        assert.equal(await getCurrentBalance() - previousBalance, 40-3);
    });


    ////////////////// CLEANING

    it("Restore ganache timestamp", async () => {
        await advanceBlockAtTime(Math.floor(Date.now() / 1000));
    });
});