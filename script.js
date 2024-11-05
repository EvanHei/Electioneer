var electioneer;
var userAccount;

// Contract address must be updated to match Ganache
const CONTRACT_ADDRESS = "";
const ABI_PATH = "build/contracts/Electioneer.json";

// Load the contract ABI from the specified JSON file and initialize the contract instance
async function loadContract() {
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
    var allTab = document.getElementById('allTab');
    var myBallotsTab = document.getElementById('myBallotsTab');
    var authorizedTab = document.getElementById('authorizedTab');

    // Set up click event handlers using the tab variables
    allTab.onclick = function() {
        showTab('all');
    };
    myBallotsTab.onclick = function() {
        showTab('myBallots');
    };
    authorizedTab.onclick = function() {
        showTab('authorized');
    };
}

// Initialize the web app
window.addEventListener("load", async () => {
    await connectToEthereum();
    await loadContract();
    bindUIEvents();
});

function showTab(tabName) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    const activeTab = document.getElementById(`${tabName}Tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}
