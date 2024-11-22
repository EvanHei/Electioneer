export var electioneer;
export var userAccount;

// contract address must be updated to match Ganache
const ELECTIONEER_CONTRACT_ADDRESS = "0xAc6a1845821e306947A61120779d2806859eFd23";
const ELECTIONEER_ABI_PATH = "build/contracts/Electioneer.json";
const BALLOT_ABI_PATH = "build/contracts/Ballot.json";

// load the contract ABI from the specified JSON file and initialize the contract instance
export async function loadContract() {
    try {
        // load Electioneer contract
        const electioneerResponse = await fetch(ELECTIONEER_ABI_PATH);
        const electioneerContractData = await electioneerResponse.json();
        const electioneerAbi = electioneerContractData.abi;
        electioneer = new web3.eth.Contract(electioneerAbi, ELECTIONEER_CONTRACT_ADDRESS);
    } catch (error) {
        console.error("Failed to load contract ABI:", error);
    }
}

// connect to the Ethereum provider (MetaMask or other web3 provider) and fetch user account
export async function connectToEthereum() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            userAccount = accounts[0];
        } catch (error) {
            console.error("User denied account access", error);
        }
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0];
    } else {
        console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
}

// load array of name and address for all ballots
export async function loadBallots() {
    try {
        // array of ballot addresses
        const ballots = await electioneer.methods.getBallots().call();

        const processedBallots = [];
        for (let i = 0; i < ballots.length; i++) {
            const address = ballots[i];
            const { ballotName: name, owner, authorizedVoters } = await electioneer.methods.getBallotDetails(address).call();

            processedBallots.push({
                name: name,
                address: address,
                owner: owner,
                authorizedVoters: authorizedVoters
            });
        }
        return processedBallots;
    } catch (error) {
        console.error("Failed to fetch ballots:", error);
        return [];
    }
}

// add a new proposal to a ballot
export async function addProposal(proposal, ballotAddress) {
    try {
        if (!proposal) {
            throw new Error("Proposal text cannot be empty.");
        }

        // load Ballot contract
        const ballotResponse = await fetch(BALLOT_ABI_PATH);
        const ballotContractData = await ballotResponse.json();
        var ballotAbi = ballotContractData.abi;        
        let ballot = new web3.eth.Contract(ballotAbi, ballotAddress);

        // call addProposal(...)
        const transaction = await ballot.methods.registerProposal(proposal).send({ from: userAccount });

        console.log("Proposal added successfully:", proposalText);
        return transaction;
    } catch (error) {
        console.error("Failed to add proposal:", error.message);
        return false;
    }
}

// get all proposals from a ballot
export async function getProposals(ballotAddress) {
    try {
        // load Ballot contract
        const ballotResponse = await fetch(BALLOT_ABI_PATH);
        const ballotContractData = await ballotResponse.json();
        var ballotAbi = ballotContractData.abi;        
        let ballot = new web3.eth.Contract(ballotAbi, ballotAddress);

        // call addProposal(...)
        const transaction = await ballot.methods.getProposals().call();

        console.log("Got proposals from:", ballotAddress);
        return transaction;
    } catch (error) {
        console.error("Failed to get proposals:", error.message);
        return false;
    }
}

// authorize a voter
export async function authorizeVoter(voterAddress, ballotAddress) {
    try {
        if (!voterAddress) {
            throw new Error("VoterAddress text cannot be empty.");
        }

        // TODO: create helper method for loading a ballot contract
        // load Ballot contract
        const ballotResponse = await fetch(BALLOT_ABI_PATH);
        const ballotContractData = await ballotResponse.json();
        var ballotAbi = ballotContractData.abi;        
        let ballot = new web3.eth.Contract(ballotAbi, ballotAddress);

        // call authorizeVoter(...)
        const transaction = await ballot.methods.authorizeVoter(voterAddress).send({ from: userAccount });

        console.log("Voter authorized successfully:", voterAddress);
        return transaction;
    } catch (error) {
        console.error("Failed to authorize voter:", error.message);
        return false;
    }
}

// revoke a voter
export async function revokeVoter(voterAddress, ballotAddress) {
    try {
        if (!voterAddress) {
            throw new Error("VoterAddress text cannot be empty.");
        }

        // load Ballot contract
        const ballotResponse = await fetch(BALLOT_ABI_PATH);
        const ballotContractData = await ballotResponse.json();
        var ballotAbi = ballotContractData.abi;        
        let ballot = new web3.eth.Contract(ballotAbi, ballotAddress);

        // call revokeVoterAuthorization(...)
        const transaction = await ballot.methods.revokeVoter(voterAddress).send({ from: userAccount });

        console.log("Voter revoked successfully:", voterAddress);
        return transaction;
    } catch (error) {
        console.error("Failed to revoke voter:", error.message);
        return false;
    }
}
