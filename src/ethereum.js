export var electioneer;
export var userAddress;

// contract address must be updated to match Ganache
const ELECTIONEER_CONTRACT_ADDRESS = "0x251C7e26A9118E4BeB4628bf91E110385958004E";
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
            userAddress = accounts[0];
        } catch (error) {
            console.error("User denied account access", error);
        }
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.getAccounts();
        userAddress = accounts[0];
    } else {
        console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
}

// load array of all ballots and their details
export async function loadBallots() {
    try {
        // array of ballot addresses
        const ballotsAddresses = await electioneer.methods.getBallotAddresses().call();

        const ballots = [];
        for (let i = 0; i < ballotsAddresses.length; i++) {
            const address = ballotsAddresses[i];
            let ballot = await loadBallotContract(address);

            // get the ballot details
            const owner = await ballot.methods.owner().call();
            const name = await ballot.methods.name().call();
            const totalProposals = await ballot.methods.totalProposals().call();
            const totalVotes = await ballot.methods.totalVotes().call();
            const authorizedAddresses = await ballot.methods.getAuthorizedAddresses().call();
            const startTime = await ballot.methods.startTime().call();
            const endTime = await ballot.methods.endTime().call();
            let winners = "N/A";

            // get winner(s) if ballot is still active and there are proposals
            const active = await ballot.methods.isActive().call();
            if (!active && totalProposals > 0 && totalVotes > 0) {
                winners = await ballot.methods.getWinners().call();
            }

            // format data
            const formattedStartTime = new Date(startTime * 1000).toLocaleString();
            const formattedEndTime = new Date(endTime * 1000).toLocaleString();

            ballots.push({
                name: name,
                address: address,
                owner: owner,
                authorizedAddresses: authorizedAddresses,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                winners: winners,
                totalVotes: totalVotes,
                totalProposals: totalProposals
            });
        }
        return ballots;
    } catch (error) {
        console.error("Failed to fetch ballots:", error);
        return [];
    }
}

// loads a single ballot's details
export async function loadBallotDetails(ballotAddress) {
    try {
        const ballots = await loadBallots();
        const matchingBallot = ballots.find(ballot => ballot.address === ballotAddress);
        return matchingBallot || null;
    } catch (error) {
        console.error(`Failed to fetch ballot details for address ${ballotAddress}:`, error);
        return null;
    }
}

// get the proposal a voter voted for
export async function getVoterProposalName(voterAddress, ballotAddress) {
    try {
        let ballot = await loadBallotContract(ballotAddress);
        const voter = await ballot.methods.voters(voterAddress).call();

        if (!voter.voted) {
            return "N/A";
        }

        const proposal = await ballot.methods.getProposalById(voter.proposalId).call();
        return proposal.name;
    } catch (error) {
        console.error("Error fetching voter proposal name:", error);
        throw error;
    }
}

// add a new proposal to a ballot
export async function addProposal(proposal, ballotAddress) {
    try {
        let ballot = await loadBallotContract(ballotAddress);
        await ballot.methods.registerProposal(proposal).send({ from: userAddress });
        console.log("Registered proposal:", proposal);
    } catch (error) {
        console.error("Failed to add proposal:", error.message);
    }
}

// get all proposals from a ballot
export async function getProposals(ballotAddress) {
    try {      
        let ballot = await loadBallotContract(ballotAddress);
        const transaction = await ballot.methods.getProposals().call();
        return transaction;
    } catch (error) {
        console.error("Failed to get proposals:", error.message);
    }
}

// get all voters who voted for a proposal
export async function getProposalVoters(proposalId, ballotAddress) {
    try {      
        let ballot = await loadBallotContract(ballotAddress);
        const transaction = await ballot.methods.getProposalVoters(proposalId).call();
        return transaction;
    } catch (error) {
        console.error("Failed to get proposal voters:", error.message);
    }
}

// authorize a voter
export async function authorizeVoter(voterAddress, ballotAddress) {
    try {
        let ballot = await loadBallotContract(ballotAddress);
        await ballot.methods.authorizeVoter(voterAddress).send({ from: userAddress });
        console.log("Authorized voter:", voterAddress);
    } catch (error) {
        console.error("Failed to authorize voter:", error.message);
    }
}

// revoke a voter
export async function revokeVoter(voterAddress, ballotAddress) {
    try {
        let ballot = await loadBallotContract(ballotAddress);
        await ballot.methods.revokeVoter(voterAddress).send({ from: userAddress });
        console.log("Revoked voter:", voterAddress);
    } catch (error) {
        console.error("Failed to revoke voter:", error.message);
        return false;
    }
}

// vote
export async function vote(proposalName, ballotAddress) {
    try {
        let ballot = await loadBallotContract(ballotAddress);

        // query ID of the correct proposal
        const proposals = await getProposals(ballotAddress);
        const matchingProposal = proposals.find(proposal => proposal.name === proposalName);    

        await ballot.methods.vote(matchingProposal.id).send({ from: userAddress });

        console.log("Voted on ballot:", ballotAddress);
    } catch (error) {
        console.error("Failed to vote:", error.message);
        return false;
    }
}

// load a ballot contract
async function loadBallotContract(ballotAddress) {
    const ballotResponse = await fetch(BALLOT_ABI_PATH);
    const ballotContractData = await ballotResponse.json();
    var ballotAbi = ballotContractData.abi;        
    let ballot = new web3.eth.Contract(ballotAbi, ballotAddress);
    return ballot;
}
