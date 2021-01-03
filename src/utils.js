export function getJson(url) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(null);
    });
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
