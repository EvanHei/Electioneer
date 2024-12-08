# Electioneer

A blockchain solution for secure and transparent voting.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Guide](#guide)
3. [Technologies](#technologies)

## Getting Started

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

Next, link your Ganache project to Electioneer by setting the truffle-init.js file:

Then run the following command to deploy to the local blockchain:
```bash
truffle migrate
```

Start the server by running http-server:
```bash
http-server
```

Navigate to the port where the server has started.

## Guide

### All Tab

Allows viewing of all the contracts on the blockchain.

- **Search**: allows filtering based on name.

<img src="" width="300">

### My Ballots Tab

Allows management of the current user's ballots including creation and , authorization / revocation of other users.

<img src="" width="300">

### Authorized Tab

Allows voting on ballots on which the current user is authorized.

<img src="" width="300">

## Technologies

- **Browser**: Firefox
- **IDE**: VSCode
- **Frontend Languages**: HTML, CSS, JavaScript
- **Backend Language**: Solidity
- **Blockchain**: Ethereum
- **Version Control**: Git / GitHub
- **Wallet**: Metamask
- **Services**: Node.js, Truffle, http-server
