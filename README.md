# Electioneer

A blockchain solution for secure and transparent voting.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Guide](#guide)
3. [Technologies](#technologies)

## Getting Started

### Prerequisites

Before running, ensure you have the following installed:

1. **[Node.js](https://nodejs.org/)**: JavaScript runtime with npm (Node Package Manager).
2. **[Ganache](https://trufflesuite.com/ganache/)**: Local Ethereum blockchain for testing.
3. **Truffle**: Install with npm:
   ```bash
   npm install -g truffle
   ```
4. **[MetaMask](https://metamask.io/)**: Browser wallet to interact with the blockchain.
5. **Local Server**: Install with npm:
   ```bash
   npm install -g http-server
   ```
6. **[Firefox](https://www.mozilla.org/en-US/firefox/new/?gad_source=1&gclid=Cj0KCQiApNW6BhD5ARIsACmEbkUlgNBYWfrP3wyR9NmGqGixfWBUJ-zoVAg0m5lOsRxyLRenL5dA0UIaAkEkEALw_wcB)** or **[Chrome](https://www.google.com/chrome/?brand=QCTP&gad_source=1&gclid=Cj0KCQiApNW6BhD5ARIsACmEbkUaQO5p_oTU3dZ_FtsB3CPu6ChC8u8GkH4maRU3UtIfwukU8l03U_YaAsSKEALw_wcB&gclsrc=aw.ds)**

### Deploying to Ganache

Clone this repository from GitHub by downloading the .zip or using your preferred method.

Next, create a new workspace in Ganache by clicking the "New Workspace" button:

<img src="images/GanacheNewWorkspace.png" width="200">

Link your Ganache project to Electioneer by clicking "Add Project" and selecting the truffle-config.js file:

<img src="images/Selecting truffle-config.js.png" width="400">

The fully configured Ganache project should look like this:

<img src="images/GanacheWorkspaceConfig.png" width="500">

Click start to run your local blockchain, then run the following command to deploy:

```bash
truffle migrate
```

Once deployed, copy the Electioneer contract address:

<img src="images/GanacheElectioneerAddress.png" width="800">

Paste it into line 5 of the ethereum.js file:

<img src="images/VSCodeElectioneerAddress.png" width="800">

Start the local server by running http-server:

```bash
http-server
```

Navigate to the local IP address and port where the server has started in a web browser.

### Connecting with Metamask

To connect with Metamask, click the dropdown list on the top left corner:

<img src="images/MetaMaskNetworkDropdown.png" width="50">

Click "Add network":

<img src="images/MetaMaskAddNetwork.png" width="250">

Click "Add a network manually":

<img src="images/MetaMaskAddANetworkManually.png" width="200">

Fill in the network details to match Ganache and click "Save":

<img src="images/GanacheNetworkDetails.png" width="200">

<img src="images/MetaMaskNetworkDetails.png" width="500">

To import an account to Metamask, navigate to the Ganache Accounts tab and click on the key symbol next to any account:

<img src="images/GanacheAddressEntry.png" width="500">

Copy the private key:

<img src="images/GanacheAddressPrivateKey.png" width="500">

In Metamask, click the dropdown next to your current account

<img src="images/MetaMaskAccountDropdown.png" width="300">

Click "Add account or hardware wallet":

<img src="images/MetaMaskAddAccount.png" width="250">

Click "Import account":

<img src="images/MetaMaskImportAccount.png" width="300">

Paste the private key into the text box and click "Import":

<img src="images/MetaMaskPastePrivateKey.png" width="300">

When prompted to connect, check the account you imported and click "Next". You may have to refresh the page:

<img src="images/MetaMaskConnect.png" width="300">

When prompted, click "Confirm" to allow permissions:

<img src="images/MetaMaskPermissions.png" width="300">

You will now be able to confirm transactions when using Electioneer by clicking "Confirm" when prompted:

<img src="images/MetaMaskApproveTransaction.png" width="300">

## Guide

### All

Allows viewing and filtering all the ballots on the blockchain:

<img src="images/ElectioneerAllTab.png" width="400">

### My Ballots

Click the New button to open a ballot creation window:

<img src="images/ElectioneerCreateBallot.png" width="400">

Click on a ballot to open a management window:

<img src="images/ElectioneerManageBallot.png" width="400">

### Authorized

Click on a ballot from the list displayed below to open the voting window:

<img src="images/ElectioneerAuthorizedTab.png" width="300">

Click on a proposal and click "Vote" to cast your vote:

<img src="images/ElectioneerVoting.png" width="300">

Once a ballot has finished you may view the winner(s) (you may need to create another transaction on the blockchain to get Ganache to refresh):

<img src="images/ElectioneerBallotFinished.png" width="300">

Click on a proposal to view which address cast their vote in its favor:

<img src="images/ElectioneerProposalVoters.png" width="300">

## Technologies

- **Browsers**: Firefox, Chrome
- **IDE**: VSCode
- **Frontend Languages**: HTML, CSS, JavaScript
- **Backend Language**: Solidity
- **Blockchain**: Ethereum
- **Version Control**: Git / GitHub
- **Wallet**: Metamask
- **Services**: Node.js, Truffle, http-server
