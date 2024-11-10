export var electioneer;
export var userAccount;

// Contract address must be updated to match Ganache
const ELECTIONEER_CONTRACT_ADDRESS = "0x1970e62BdF1846a5749DE7471168Fbd8e3FcE921";
const ELECTIONEER_ABI_PATH = "build/contracts/Electioneer.json";
const BALLOT_ABI_PATH = "build/contracts/Ballot.json";

// Load the contract ABI from the specified JSON file and initialize the contract instance
export async function loadContract() {
    try {
        // Load Electioneer contract
        const electioneerResponse = await fetch(ELECTIONEER_ABI_PATH);
        const electioneerContractData = await electioneerResponse.json();
        const electioneerAbi = electioneerContractData.abi;
        electioneer = new web3.eth.Contract(electioneerAbi, ELECTIONEER_CONTRACT_ADDRESS);
    } catch (error) {
        console.error("Failed to load contract ABI:", error);
    }
}

// Connect to the Ethereum provider (MetaMask or other web3 provider) and fetch user account
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

// Load array of name and address for all ballots
export async function loadBallots() {
    try {
        // Array of ballot addresses
        const ballots = await electioneer.methods.getBallots().call();

        const processedBallots = [];
        for (let i = 0; i < ballots.length; i++) {
            const address = ballots[i];
            const { ballotName: name, owner } = await electioneer.methods.getBallotDetails(address).call();

            processedBallots.push({
                name: name,
                address: address,
                owner: owner
            });
        }
        return processedBallots;
    } catch (error) {
        console.error("Failed to fetch ballots:", error);
        return [];
    }
}

// Add a new proposal to a ballot
export async function addProposal(proposal, ballotAddress) {
    try {
        if (!proposal) {
            throw new Error("Proposal text cannot be empty.");
        }

        // Load Ballot contract
        const ballotResponse = await fetch(BALLOT_ABI_PATH);
        const ballotContractData = await ballotResponse.json();
        var ballotAbi = ballotContractData.abi;        
        let ballot = new web3.eth.Contract(ballotAbi, ballotAddress);

        // Call addProposal(...)
        const transaction = await ballot.methods.registerProposal(proposal).send({ from: userAccount });

        console.log("Proposal added successfully:", proposalText);
        return transaction;
    } catch (error) {
        console.error("Failed to add proposal:", error.message);
        return false;
    }
}

// Get all proposals from a ballot
export async function getProposals(ballotAddress) {
    try {
        // Load Ballot contract
        const ballotResponse = await fetch(BALLOT_ABI_PATH);
        const ballotContractData = await ballotResponse.json();
        var ballotAbi = ballotContractData.abi;        
        let ballot = new web3.eth.Contract(ballotAbi, ballotAddress);

        // Call addProposal(...)
        const transaction = await ballot.methods.getProposals().call();

        console.log("Got proposals from:", ballotAddress);
        return transaction;
    } catch (error) {
        console.error("Failed to get proposals:", error.message);
        return false;
    }
}
