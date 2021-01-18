![Ultimate Dogecoin Infinity 2](team-logo.png)

# Ethereum: Auction platform

[![License GPL3](https://img.shields.io/badge/license-GPL3-green)](LICENSE)
[![100% Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](test/Auction.test.js)
[![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-orange.svg)](test/Auction.test.js)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-green.svg)
![Dogeness](https://img.shields.io/badge/dogeness-infinity-yellow)
![Build Passing](https://img.shields.io/badge/build-passing-green)
![Rating](https://img.shields.io/badge/rating-%E2%98%85%E2%98%85%E2%98%85%E2%98%85%E2%98%85-red)
![Build Passing](https://img.shields.io/badge/patreons-1-blueviolet)
![Funding](https://img.shields.io/badge/Funding-0%25-informational)


Student project for blockchain fundamentals course.

## Project overview

-   This project is an implementation of Vickrey auction on Ethereum blockchain using Solidity.
-   A user is able to create an auction by providing a starting price, two phase deadlines, and description of an item/service to be sold.
-   For a given auction, users are be able to bid by locking their funds (possibly greater than the placed) in the contract without revealing their actual bid.
-   After the first deadline users must reveal their bids for them to be considered. Users cannot create new bids now.
-   After the second deadline, respective funds can be withdrawn by the interested parties. Winner (if any) withdraws the difference between their bid and the second price, while the auction creator withdraws the second price.

Full description of the project can be found here: [Documentation (PL)](Dokumentacja.md).

## First time setup

1. Install `node`, `npm` and `ganache`.
1. Add `MetaMask` to [chrome](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) or [firefox](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/).
1. Run `npm install`.
1. Run `Ganache` and perform first time setup.
1. Connect `MetaMask` to your `Ganache` account of choice.
1. Link this project to Ganache workspace (in Ganache: settings -> workspace -> ADD PROJECT -> select truffle-config.js)
1. Run `npm run deploy` in cloned directory.

## Setup

1. Ensure that `Ganache` is running.
1. Run `npm run dev` in cloned directory.
1. Go to [localhost:3000](http://localhost:3000/).

## Authors

-   [Wojciech Buczek](https://github.com/Wowol)
-   [Krzysztof Pióro](https://github.com/krzysztofpioro)
-   [Marcin Serwin](https://github.com/marcin-serwin)

[![Fractal Doge](https://media4.giphy.com/media/54Vj1kxvgyF4k/giphy.gif)](http://gph.is/1fDc0lE)

## Licenses and acknowledgments

Project code is distributed under the [GPL3 License](https://www.gnu.org/licenses/gpl-3.0.html). See [LICENSE](LICENSE) for more information.

Ultimate Dogecoin Infinity 2 logo is distributed under [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/)

Fractal doge gif is distributed directly via [Giphy](http://gph.is/1fDc0lE) service.
