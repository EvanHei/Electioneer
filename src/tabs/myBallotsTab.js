import { loadBallots, getProposals, addProposal, authorizeVoter, revokeVoter, userAccount } from '../ethereum.js';
import { activateTab } from '../helpers.js';
import { electioneer } from '../ethereum.js';

const contentContainer = document.getElementById("content");

export async function myBallotsTabClick() {
    activateTab(document.getElementById('myBallotsTab'));

    // Create a new element for My Ballots content
    const myBallotsContent = document.createElement('div');
    myBallotsContent.classList.add('content');

    // Load and filter my ballots
    const ballots = await loadBallots();
    const myBallots = ballots.filter(
        ballot => ballot.owner.toLowerCase() === userAccount.toLowerCase()
    );

    // Build the ballot list
    let content = '<div class="scrollable-box"><div class="item-list">';
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
        </div></div>
        <button class="button" id="createButton">Create</button>
    `;

    myBallotsContent.innerHTML = content;

    // configure ballot clicks
    myBallotsContent.addEventListener('click', (event) => {

        // check if the clicked element is a ballot item
        if (event.target.closest('.item')) {
            const item = event.target.closest('.item');
            displayBallotDetails(item);
        }
    });
    
    contentContainer.innerHTML = '';
    contentContainer.appendChild(myBallotsContent);

    // Configure Create button
    const createButton = document.getElementById('createButton');
    createButton.onclick = createButtonClick;
}

async function displayBallotDetails(item) {

    // create a new element for ballot details content
    const ballotDetailsContent = document.createElement('div');
    ballotDetailsContent.classList.add('content');

    // load proposals
    const ballotAddress = item.getAttribute('data-address');
    const proposals = await getProposals(ballotAddress);
    const proposalNames = proposals.map(proposal => proposal.name);

    // populate input fields
    let content = `
    <h2>${item.querySelector('span').textContent}</h2>
    
    <!-- Authorize Input Field -->
    <div class="input-field">
        <label for="authorizeInput">Authorize</label>
        <input type="text" id="authorizeInput" placeholder="Public address">
        <button id="authroizeArrowButton" class="input-arrow">→</button>
    </div>

    <!-- Revoke Input Field -->
    <div class="input-field">
        <label for="revokeInput">Revoke</label>
        <input type="text" id="revokeInput" placeholder="Public address">
        <button id="revokeArrowButton" class="input-arrow">→</button>
    </div>

    <!-- New Proposal Input Field -->
    <div class="input-field">
        <label for="newProposalInput">New Proposal</label>
        <input type="text" id="newProposalInput" placeholder="Name, law, bill, ...">
        <button id="newProposalArrowButton" class="input-arrow">→</button>
    </div>
    
    <!-- Proposals List -->
    <h2>Proposals</h2>
    <div class="scrollable-box">
    `;

    // TODO: show votes to the right of each list item
    // populate proposal list
    if (proposalNames && proposalNames.length > 0) {
        proposalNames.forEach((proposalName) => {
            content += `
            <div class="item">
                ${proposalName}
            </div>
            `;
        });
    }
    content += `
    </div>
    <button class="button" id="backButton">Back</button>
    `;

    // TODO: add a authorized list

    ballotDetailsContent.innerHTML = content;
    contentContainer.innerHTML = '';
    contentContainer.appendChild(ballotDetailsContent);

    // configure Back button
    document.getElementById("backButton").onclick = myBallotsTabClick;

    // configure → buttons
    document.getElementById("authroizeArrowButton").onclick = () => authorizeArrowButtonClick(ballotAddress);
    document.getElementById("revokeArrowButton").onclick = () => revokeArrowClick(ballotAddress);
    document.getElementById("newProposalArrowButton").onclick = () => newProposalArrowClick(item);
}

async function authorizeArrowButtonClick(ballotAddress) {
    const authorizeInput = document.getElementById("authorizeInput");
    const voterAddress = authorizeInput.value;
    await authorizeVoter(voterAddress, ballotAddress);

    // TODO: show an error message if the voter is already authorized

    // clear input
    authorizeInput.value = "";
}

// TODO: implement
async function revokeArrowClick(ballotAddress) {
    const revokeInput = document.getElementById("revokeInput");
    const voterAddress = revokeInput.value;
    await revokeVoter(voterAddress, ballotAddress);

    // clear input
    revokeInput.value = '';
}

async function newProposalArrowClick(item) {

    // retrieve data
    const newProposalInput = document.getElementById("newProposalInput").value;
    const ballotAddress = item.getAttribute('data-address');

    // add proposal
    await addProposal(newProposalInput, ballotAddress);

    // refresh proposal list
    await displayBallotDetails(item);
}

async function createButtonClick() {
    // get input
    const ballotName = window.prompt('Enter ballot name:');
    const durationInMinutes = window.prompt('Enter duration in minutes:');
    
    // validate
    if (!ballotName || !durationInMinutes) {
        alert('Please enter both ballot name and duration.');
        return;
    }
    const duration = parseInt(durationInMinutes, 10);

    // create ballot
    try {
        await electioneer.methods.createBallot(ballotName, duration).send({ from: userAccount });
        alert('Ballot created successfully!');
    } catch (error) {
        console.error('Error creating ballot:', error);
        alert('Failed to create ballot.');
    }

    myBallotsTab.click();
}