import { loadContract, connectToEthereum, loadBallots, addProposal, getProposals, electioneer, userAccount } from './ethereum.js';
const contentContainer = document.getElementById("content");

// Bind UI events to functions
function bindUIEvents() {
    var allTab = document.getElementById('allTab');
    var myBallotsTab = document.getElementById('myBallotsTab');
    var authorizedTab = document.getElementById('authorizedTab');

    allTab.onclick = allTabClick;
    myBallotsTab.onclick = myBallotsTabClick;
    authorizedTab.onclick = authorizedTabClick;
}

// Initialize the web app
window.addEventListener("load", async () => {
    await connectToEthereum();
    await loadContract();
    bindUIEvents();
    allTab.click();
});

async function allTabClick() {
    activateTab(allTab);

    // Load ballots
    const ballots = await loadBallots();
    let content = '<div class="item-list">';
    for (const ballot of ballots) {
        content += `
            <div class="item" data-address="${ballot.address}">
                ${ballot.name}
                <span class="subscript">${ballot.address}</span>
            </div>
        `;
    }
    content += '</div>';

    contentContainer.innerHTML = content;
}

async function myBallotsTabClick() {
    activateTab(myBallotsTab);
        
    // Load only the user's ballots
    const ballots = await loadBallots();
    const myBallots = [];
    for (const ballot of ballots) {
        if (ballot.owner.toLowerCase() === userAccount.toLowerCase()) {
            myBallots.push({
                name: ballot.name,
                address: ballot.address
            });
        }
    }
    
    // Generate content for my ballots
    let content = '<div class="item-list">';
    for (const ballot of myBallots) {
        content += `
        <div class="item" data-address="${ballot.address}">
            <span>${ballot.name}</span>
            <span class="subscript">${ballot.address}</span>
            <button class="wrench-button">🔧️</button>
        </div>
        `;
    }
    content += '</div>';

    // Configure Create button
    content += '<button class="button" id="createButton">Create</button>';
    contentContainer.innerHTML = content;
    const createButton = document.getElementById("createButton");
    createButton.onclick = createButtonClick;

    // Configure 🔧️ buttons
    const wrenchButtons = document.querySelectorAll('.wrench-button');
    wrenchButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
            const item = event.target.closest('.item');
            const ballotAddress = item.getAttribute('data-address');
            const proposals = await getProposals(ballotAddress);
            const proposalNames = proposals.map(proposal => proposal.name);

            // Generate content
            content = `
                <h2>${item.querySelector('span').textContent}</h2>
                
                <!-- Authorize Input Field -->
                <div class="input-field">
                    <label for="authorizeInput">Authorize</label>
                    <input type="text" id="authorizeInput">
                    <button id="authroizeArrowButton" class="input-arrow">→</button>
                </div>

                <!-- Revoke Input Field -->
                <div class="input-field">
                    <label for="revokeInput">Revoke</label>
                    <input type="text" id="revokeInput">
                    <button id="revokeArrowButton" class="input-arrow">→</button>
                </div>

                <!-- New Proposal Input Field -->
                <div class="input-field">
                    <label for="newProposalInput">New Proposal</label>
                    <input type="text" id="newProposalInput">
                    <button id="newProposalArrowButton" class="input-arrow">→</button>
                </div>
                
                <!-- Proposals List -->
                <h2>Proposals</h2>
                <ul>
            `;
            
            // TODO: format better and make
            // Add each proposal to the list
            if (proposalNames && proposalNames.length > 0) {
                proposalNames.forEach((proposalName) => {
                    content += `
                    <li>${proposalName}</li>
                    `;
                });
            } else {
                content += `<li>No proposals.</li>`;
            }
            
            content += `
            </ul>
            </div>
            `;
            
            // TODO: move back button above proposal list
            // Configure Back button
            content += '<button class="button" id="backButton">Back</button>';
            contentContainer.innerHTML = content;
            const backButton = document.getElementById("backButton");
            backButton.onclick = myBallotsTabClick;

            // Configure → buttons
            const authorizeArrowButton = document.getElementById("authroizeArrowButton");
            const revokeArrowButton = document.getElementById("revokeArrowButton");
            const newProposalArrowButton = document.getElementById("newProposalArrowButton");
            authorizeArrowButton.onclick = () => authorizeArrowButtonClick(ballotAddress);
            revokeArrowButton.onclick = () => revokeArrowClick(ballotAddress);
            newProposalArrowButton.onclick = () => newProposalArrowClick(ballotAddress);
        });
    });
}

function authorizeArrowButtonClick(ballotAddress) {
    const authorizeInput = document.getElementById("authorizeInput").value;
}

function revokeArrowClick(ballotAddress) {
    const revokeInput = document.getElementById("revokeInput").value;
}

function newProposalArrowClick(ballotAddress) {
    const newProposalInput = document.getElementById("newProposalInput").value;
    addProposal(newProposalInput, ballotAddress);

    // TODO: change to redisplay the current page (editing the current ballot)
    myBallotsTab.click();
}

async function authorizedTabClick() {
    activateTab(authorizedTab);

    // Load content
    const content = `Loading...`;
  
    contentContainer.innerHTML = content;
}

async function createButtonClick() {
    // Get input
    const ballotName = window.prompt('Enter ballot name:');
    const durationInMinutes = window.prompt('Enter duration in minutes:');
    
    // Validate
    if (!ballotName || !durationInMinutes) {
        alert('Please enter both ballot name and duration.');
        return;
    }
    const duration = parseInt(durationInMinutes, 10);

    // Create ballot
    try {
        await electioneer.methods.createBallot(ballotName, duration).send({ from: userAccount });
        alert('Ballot created successfully!');
    } catch (error) {
        console.error('Error creating ballot:', error);
        alert('Failed to create ballot.');
    }

    myBallotsTab.click();
}

function activateTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
}