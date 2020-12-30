const ELEMS = {
    ACCOUNT: document.getElementById("account"),
    MAIN: document.getElementById("main"),
    LOADING: document.getElementById("loading"),
};

const App = {
    account: "",

    load: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.render();
    },

    async loadWeb3() {
        App.web3provider = ethereum;
        window.web3 = new Web3(App.web3provider);
        try {
            // Request account access if needed
            await ethereum.request({ method: "eth_requestAccounts" });
            // Acccounts now exposed
            web3.eth.sendTransaction({
                /* ... */
            });
        } catch (error) {
            // User denied account access...
        }
    },

    async loadAccount() {
        App.account = (await web3.eth.getAccounts())[0];
    },

    async render() {
        ELEMS.ACCOUNT.textContent = App.account;

        ELEMS.MAIN.hidden = false;
        ELEMS.LOADING.hidden = true;
    },
};

(() => {
    window.onload = () => {
        App.load();
    };
})();
