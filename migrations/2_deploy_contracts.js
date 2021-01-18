const Auction = artifacts.require("./Auction.sol");
const AuctionFactory = artifacts.require("./AuctionFactory.sol");

module.exports = function (deployer) {
    deployer.deploy(Auction).then(() => deployer.deploy(AuctionFactory, Auction.address));
};