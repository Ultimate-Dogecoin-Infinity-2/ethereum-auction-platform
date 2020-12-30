interface Window {
    web3: import("web3").default;
}

declare const web3: import("web3").default;
declare const Web3: (any) => void;
declare const TruffleContract: (
    any
) => import("@truffle/contract").default.Contract;
declare const ethereum;
