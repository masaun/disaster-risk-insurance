# Disaster Risk Insurance

- This is the Disaster Risk Insurance project to build a dapp that calls a [Honeycomb marketplace](https://honeycomb.market) API through a [Chainlink](https://chain.link) node over the Ropsten testnet.


<br>

## UI and process of Disaster Risk Insurance

Once you follow the previous steps, your browser should display the page below at `http://localhost:3000/`.
If the page is blank, try logging in to your MetaMask add-on.

<p align="center">
  <img src="https://user-images.githubusercontent.com/19357502/69968567-f4e1e780-151a-11ea-9a1c-2f2015e51e05.png"/>
</p>

- [Basic process]:
  - This is the Disaster Risk Insurance project of an oracle-connected dapp.
  - The oracle returns a city name which is matched IP-address of being requested from current user.
  - The users can fund premiums between 0.1ETH ~ 0.5ETH.
  In case it happen disaster in your city, you can receive 2 times insurance money which you funded premiums until previous time of happening disaster.
  - If result of request that user's city name which called by registerd IP address match with city name of disaster area, user can receive withdrawed insurance money from fund pool of premiums automatically by smart contract. 

<br>

- [Some premise]:
  - User need to register with their wallet-address and IP-address as benefically
  - Disaster area also need to register with city name and isDisaster (Define both of properties in struct of `DisasterArea` ) 
    (Next time, I will find and implement disaster area API)

<br>


## Replace the ipStack with a Honeycomb API

See how the JobID of ipStack API is set in `migrations/4_deploy_disaster_risk_insurance.js`:

`const jobId_1 = web3.utils.toHex("d1d029a5f50c44789f19da3ec4e51e7b");`    // This jobId's data-type is bytes32
`const jobId_2 = web3.utils.toHex("c62efeba282f48dcb5a1d5b7b7cade9d");`    // This jobId's data-type is int256
`const jobId_3 = web3.utils.toHex("11a18a9089bd4c668f13f5e5df5547b8");`    // This jobId's data-type is uint256

The `honeycomb.market` Ropsten node serves a random `int256` between two limits with this JobID.
To develop a smart contract that depends on another type of call, you are going to need to change it.

First, see [this article](https://medium.com/clc-group/honeycomb-marketplace-101-for-ethereum-developers-c7c63c2d3049) that gives a general overview of Honeycomb Marketplace.
Then, follow these steps:
- Go to [Honeycomb Marketplace](https://honeycomb.market), log in
- Click on the *Browse APIs* tab
- Click on an API
- Click on the *Connect* button of one of the paths
- Select *Ropsten Test Network* as the network
- Select [the data type you want](https://medium.com/clc-group/how-to-choose-the-data-type-on-honeycomb-marketplace-f77552099a1f)

As a result, you are going to see the Ropsten listing for that endpoint.
Replace the JobID in `migrations/4_deploy_disaster_risk_insurance.js` with the new JobID.

Note that you are also going to have to modify the smart contract based on the API you have used.
See this article for an example.

<br>


## Before installation

- Sign up to the [Honeycomb marketplace](https://honeycomb.marketplace) to access the job listings

- Install [npm](https://www.npmjs.com/get-npm)

- Install truffle globally using:

`npm install -g truffle`

- Install the Metamask add-on to your browser and create a wallet.
Note down the mnemonics.
Fund it with [Ropsten ETH](https://faucet.metamask.io/) and [Ropsten LINK](https://ropsten.chain.link/).

- Create an [Infura](https://infura.io/) account, get an endpoint URL for the Ropsten testnet and note it down.

- (Optional) Install [Visual Studio Code](https://code.visualstudio.com/)

<br>

## Installation

- Clone this repo using:

`git clone https://github.com/clc-group/honeycomb-example-project.git`

- Go to the main directory (`/honeycomb-example-project`)

- Install the dependencies for the smart contract:

`npm install`

- Create the file that you are going to enter your Infura credentials:

`cp wallet.json.example wallet.json`

- Open the newly created `wallet.json` file and enter the mnemonics and the endpoint URL you have noted down earlier, similar to `wallet.json.example`.

- Deploy the contract (Ropsten LINK will be transferred from your wallet to the contract automatically during deployment)

`npm run deploy-ropsten`

- Go to the front-end project directory (`/honeycomb-example-project/client`)

- Install the dependencies for the front-end project:

`npm install`

- Start the server

`npm run start`
