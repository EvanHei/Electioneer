import { loadBallots, getProposals, addProposal, userAccount } from '../ethereum.js';
import { activateTab } from '../helpers.js';
import { electioneer } from '../ethereum.js';

const contentContainer = document.getElementById("content");

export async function myBallotsTabClick() {
    activateTab(document.getElementById('myBallotsTab'));

    // load and filter my ballots
    const ballots = await loadBallots();
    const myBallots = ballots.filter(ballot => ballot.owner.toLowerCase() === userAccount.toLowerCase());

    // populate content
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

    content += `
    </div>
    `;

    // Configure Create button
    content += '<button class="button" id="createButton">Create</button>';
    contentContainer.innerHTML = content;
    document.getElementById("createButton").onclick = createButtonClick;

    // Configure Wrench butons
    document.querySelectorAll('.wrench-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const item = event.target.closest('.item');
            const ballotAddress = item.getAttribute('data-address');
            await displayBallotDetails(ballotAddress, item);
        });
    });
}

async function displayBallotDetails(ballotAddress, item) {

    // load proposals
    const proposals = await getProposals(ballotAddress);
    const proposalNames = proposals.map(proposal => proposal.name);

    // populate content
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
    `;

    // TODO: show votes to the right of each list item
    // Add each proposal to the list
    if (proposalNames && proposalNames.length > 0) {
        proposalNames.forEach((proposalName) => {
            content += `
            <div class="item">
                ${proposalName}
            </div>
            `;
        });
    } else {
        content += `
            <div class="item">
                No proposals.
            </div>
        `;
    }

    content += `
    </div>
    `;

    // Configure Back button
    content += '<button class="button" id="backButton">Back</button>';
    contentContainer.innerHTML = content;
    document.getElementById("backButton").onclick = myBallotsTabClick;

    // Configure → buttons
    document.getElementById("authroizeArrowButton").onclick = () => authorizeArrowButtonClick(ballotAddress);
    document.getElementById("revokeArrowButton").onclick = () => revokeArrowClick(ballotAddress);
    document.getElementById("newProposalArrowButton").onclick = () => newProposalArrowClick(ballotAddress);
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