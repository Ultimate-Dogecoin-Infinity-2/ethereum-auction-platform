const AuctionFactory = artifacts.require("./AuctionFactory.sol");
const Auction = artifacts.require("./Auction.sol")

// TESTS SETUP:
// WOJTEK BIDS 3 WEI, PLACE 105, REVEAL 5
// MAUCIN BIDS 2 WEI, PLACE 10, REVEAL 10
// KRZYS BIDS 20 WEI, PLACE 4*10=40, REVEAL 4*10=40
// AGNIESZKA BIDS 1 WEI, PLACE 1, REVEAL 1



const salt = "salt";
const returnAddress = "0xDC25EF3F5B8A186998338A2ADA83795FBA2D695E";

const bids = {

    zero: {
        bidderSecretId: 0,
        biddedPrice: 6
    },

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
    }, {
        bidderSecretId: "maucin",
        biddedPrice: 0,
    }],

    krzys: [{
        bidderSecretId: "krzys",
        biddedPrice: 20,
    }],

    agnieszka: [{
        bidderSecretId: "agnieszka",
        biddedPrice: 1,
    }]
}

function toBytes32(v) {
    return web3.utils.padLeft(web3.utils.toHex(v), 64);
}

const computeHash = (params, _salt = salt, _returnAddres = returnAddress) => {
    return web3.utils.soliditySha3(
        web3.eth.abi.encodeParameters(
            ["bytes32", "address", "uint256", "uint256"],
            [
                toBytes32(params.bidderSecretId),
                _returnAddres,
                params.biddedPrice,
                web3.utils.soliditySha3(_salt),
            ]
        )
    );
};

const revealBids = async (bid, _salt = salt, _returnAddres = returnAddress) => {
    params = {
        bidderSecretId: toBytes32(bid.bidderSecretId),
        returnAddress: _returnAddres,
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


const placeBid = async (bid, value, _salt = salt, _returnAddres = returnAddress) => {
    return await this.auction.placeBid(computeHash(bid, _salt, _returnAddres), { value: value });
}

const timeNow = Math.floor(Date.now() / 1000)


contract("Standard auction", (accounts) => {

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

    it("Try to initialize again exception", async () => {
        try {
            await this.auction.initialize(0, 0, "", 0, returnAddress);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Auction is already initialized -- Reason given: Auction is already initialized.")
        }
    });

    /////////////////// PHASE ONE

    it("wojtek creates standard bid", async () => {
        await placeBid(bids["wojtek"][0], 5);
    });

    it("wojtek tries to send same hash exception", async () => {
        try {
            await placeBid(bids["wojtek"][0], 20);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert You cannot send the same hash twice -- Reason given: You cannot send the same hash twice.")
        }
    });

    it("users create many bids", async () => {
        await placeBid(bids["zero"], 5);

        await placeBid(bids["agnieszka"][0], 1);
        await placeBid(bids["wojtek"][1], 100);
        await placeBid(bids["maucin"][0], 10);
        await placeBid(bids["maucin"][2], 5);
        await placeBid(bids["maucin"][0], 1, salt, "0xC257274276a4E539741Ca11b590B9447B26A8051");

        for (var x = 0; x < 4; x++) {
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

    it("reveal bet with id 0 exception", async () => {
        try {
            await revealBids(bids["zero"]);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Secret id cannot be 0 -- Reason given: Secret id cannot be 0.");
        }
    })

    it("wojtek reveals bid standard", async () => {
        await revealBids(bids["wojtek"][0]);
    });

    it("wojtek tries to change bidded price exception", async () => {
        try {
            await revealBids(bids["wojtek"][1]);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Bidded price cannot be changed -- Reason given: Bidded price cannot be changed.");
        }
    });

    it("maucin tries to send reveal with bidded price equal to 0 exception", async () => {
        try {
            await revealBids(bids["maucin"][2]);
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Bidded price must be greater than 0 -- Reason given: Bidded price must be greater than 0.");
        }
    })

    it("maucin reveals bid standard", async () => {
        await revealBids(bids["maucin"][0]);
    });

    it("maucin tries to change return address exception", async () => {
        try {
            await revealBids(bids["maucin"][0], salt, "0xC257274276a4E539741Ca11b590B9447B26A8051")
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Return address cannot be changed -- Reason given: Return address cannot be changed.");
        }
    });

    it("users reveal many bids", async () => {
        for (var x = 0; x < 4; x++) {
            await revealBids(bids["krzys"][0], x);
        }

        await revealBids(bids["agnieszka"][0]);
    })

    it("Withdraw in phase 2 exception", async () => {
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
        await this.auction.withdrawBidder([toBytes32("wojtek")]);
        assert.equal(await getCurrentBalance() - previousBalance, 5);
    });

    it("Second Wojtek withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([toBytes32("wojtek")]);
        assert.equal(await getCurrentBalance() - previousBalance, 0);
    });

    it("Maucin withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([toBytes32("maucin")]);
        assert.equal(await getCurrentBalance() - previousBalance, 10);
    });

    it("Krzys withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([toBytes32("krzys")]);
        assert.equal(await getCurrentBalance() - previousBalance, 40 - 3);
    });

    it("Agnieszka withdraw", async () => {
        previousBalance = await getCurrentBalance();
        await this.auction.withdrawBidder([toBytes32("agnieszka")]);
        assert.equal(await getCurrentBalance() - previousBalance, 1);
    });

    it("Krzys should win the auction", async () => {
        assert.equal(await this.auction.firstBidder(), toBytes32("krzys"));
    })



    ////////////////// CLEANING

    it("Restore ganache timestamp", async () => {
        await advanceBlockAtTime(Math.floor(Date.now() / 1000));
    });

});

contract("Bad auctions", (accounts) => {
    it("Add broken phase 2 auction exception", async () => {
        try {
            await this.auctionFactory.createAuction(timeNow - 100,
                timeNow + 10000, "Sample description", 0, returnAddress)
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Phase two should be in future -- Reason given: Phase two should be in future.");
        }
    });

    it("Add broken phase 3 auction exception", async () => {
        try {
            await this.auctionFactory.createAuction(timeNow + 100,
                timeNow + 50, "Sample description", 0, returnAddress)
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert Phase three should be after phase two -- Reason given: Phase three should be after phase two.");
        }
    });
});

contract("Auction without winner", (accounts) => {
    it("Dealer cannot withdraw money exception", async () => {
        await this.auctionFactory.createAuction(Math.floor(Date.now() / 1000) + 1000,
            Math.floor(Date.now() / 1000) + 10000, "Sample description", 10, returnAddress)
        await advanceBlockAtTime(Math.floor(Date.now() / 1000) + 20000);

        try {
            await (await Auction.at(await this.auctionFactory.auctions(0))).withdrawDealer()
            assert.fail("Exception should be thrown")
        }
        catch (e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert You cannot withdraw money if no one won the auction -- Reason given: You cannot withdraw money if no one won the auction.");
        }

    });

    ////////////////// CLEANING

    it("Restore ganache timestamp", async () => {
        await advanceBlockAtTime(Math.floor(Date.now() / 1000));
    });
});