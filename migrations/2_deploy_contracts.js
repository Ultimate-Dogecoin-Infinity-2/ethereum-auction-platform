const AuctionFactory = artifacts.require("./AuctionFactory.sol");

module.exports = function (deployer) {
    deployer.deploy(AuctionFactory);
};
