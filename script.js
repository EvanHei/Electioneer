var simpleStorage;
var userAccount;

// SimpleStorage contract address. Must be updated to match Ganache
const CONTRACT_ADDRESS = "0x17fbda146a2b991cAc5a1801627185C94889A48c";
const ABI_PATH = "build/contracts/SimpleStorage.json";

// Load the contract ABI from the specified JSON file and initialize the contract instance
async function loadContract() {
    try {
        const response = await fetch(ABI_PATH);
        const contractData = await response.json();
        const abi = contractData.abi;
        simpleStorage = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    } catch (error) {
        console.error("Failed to load contract ABI:", error);
    }
}

// Connect to the Ethereum provider (MetaMask or other web3 provider) and fetch user account
async function connectToEthereum() {
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

// Bind UI button click events to contract functions
function bindUIEvents() {
    var setValueButton = document.getElementById("setValueButton");
    var getValueButton = document.getElementById("getValueButton");

    setValueButton.addEventListener("click", async () => {
        const value = document.getElementById("valueInput").value;
        await simpleStorage.methods.set(value).send({ from: userAccount });
        console.log(`Value set to ${value}`);
    });

    getValueButton.addEventListener("click", async () => {
        const storedValue = await simpleStorage.methods.get().call();
        document.getElementById("storedValue").innerText = storedValue;
        console.log(`Stored value: ${storedValue}`);
    });
}

// Initialize the web app
window.addEventListener("load", async () => {
    await connectToEthereum();
    await loadContract();
    bindUIEvents();
});