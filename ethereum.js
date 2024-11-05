export var electioneer;
export var userAccount;

// Contract address must be updated to match Ganache
const CONTRACT_ADDRESS = "0x1970e62BdF1846a5749DE7471168Fbd8e3FcE921";
const ABI_PATH = "build/contracts/Electioneer.json";

// Load the contract ABI from the specified JSON file and initialize the contract instance
export async function loadContract() {
    try {
        const response = await fetch(ABI_PATH);
        const contractData = await response.json();
        const abi = contractData.abi;
        electioneer = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
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
