// SPDX-License-Identifier: GPL-3.0-or-later
export async function getJson(url) {
    return (await fetch(url)).json();
}

export async function createAuctionFactoryContract(web3provider, account) {
    const json = await getJson("AuctionFactory.json");
    const contract = TruffleContract(json);
    contract.setProvider(web3provider);
    contract.defaults({
        from: account,
    });

    return contract.deployed();
}

export async function createAuctionContract(web3provider, address, account) {
    const json = await getJson("Auction.json");
    const contract = TruffleContract(json);
    contract.setProvider(web3provider);
    contract.defaults({
        from: account,
    });

    return contract.at(address);
}
