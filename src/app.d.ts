// SPDX-License-Identifier: GPL-3.0-or-later
interface Window {
    web3: import("web3").default;
    App: any;
}

declare const web3: import("web3").default;
declare const Web3: (any) => void;
declare const TruffleContract: (
    any
) => any;
declare const ethereum;
