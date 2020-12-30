# Ethereum: Auction platform

Student project for blockchain fundamentals course.

## Planned functionalities

-   A user should be able to create an auction by providing a starting price, deadline, and description of an item/service to be sold.
-   For a given auction, users should be able to bid by locking their funds in the contract
-   After the deadline, funds of the winner should be automatically transferred to the auction creator, and the rest of the locked funds should be returned to users.

## First time setup

1. Install `node`, `npm` and `ganache`.
1. Add `MetaMask` to [chrome](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) or [firefox](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/).
1. Run `npm install`.
1. Run `Ganache` and perform first time setup.
1. Connect `MetaMask` to your `Ganache` account of choice.
1. Link this project to Ganache workspace (in Ganache: settings -> workspace -> ADD PROJECT -> select truffle-config.js)
1. Run `npm run deploy` in repo directory.

## Setup

1. Ensure that `Ganache` is running.
1. Run `npm run dev` in repo directory.
1. Go to [localhost:3000](http://localhost:3000/).

## Authors

-   Wojciech Buczek
-   Krzysztof Pióro
-   Marcin Serwin
