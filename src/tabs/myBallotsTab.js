import { loadBallots, loadBallotDetails, getProposals, addProposal, authorizeVoter, revokeVoter, userAddress } from '../ethereum.js';
import { activateTab } from '../helpers.js';
import { electioneer } from '../ethereum.js';

const contentContainer = document.getElementById("content");

export async function myBallotsTabClick() {
    activateTab(document.getElementById('myBallotsTab'));

    // create a new element for My Ballots content
    const myBallotsContent = document.createElement('div');
    myBallotsContent.classList.add('content');

    // load and filter my ballots
    const ballots = await loadBallots();
    const myBallots = ballots.filter(
        ballot => ballot.owner.toLowerCase() === userAddress.toLowerCase()
    );

    // sort so the ballots with the latest expiration date are at the top
    myBallots.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    // build the ballot list
    let content = '<div class="scrollable-box"><div class="item-list">';
    for (const ballot of myBallots) {

        // add the 'expired' class if the ballot is over
        const currentTime = new Date();
        const endDate = new Date(ballot.endTime);
        const expiredClass = endDate < currentTime ? 'expired' : '';
        
        content += `
            <div class="item ${expiredClass}" data-address="${ballot.address}">
                <span>${ballot.name}</span>
                <span class="subscript">Ends ${ballot.endTime}</span>
                <span class="item-icon">🔧️</span>
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

    // load specific ballot
    const ballot = await loadBallotDetails(ballotAddress);

    // determine if the ballot is expired
    const currentTime = new Date();
    const endDate = new Date(ballot.endTime);
    const expired = endDate < currentTime;
    
    let content = `<h2>${ballot.name}</h2>`;

    // populate input fields if the ballot isn't expired
    if (!expired) {
        content += `
        <!-- Authorize Input Field -->
        <div class="input-field">
            <label for="authorizeInput">Authorize</label>
            <input type="text" id="authorizeInput" placeholder="Public address">
            <button id="authorizeArrowButton" class="input-arrow">→</button>
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
            <input type="text" id="newProposalInput" placeholder="Candidate, law, bill, ...">
            <button id="newProposalArrowButton" class="input-arrow">→</button>
        </div>
        `;
    }    
    
    // add proposal list
    content += `
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

    <!-- Authorized Addresses List -->
    <h2>Authorized Addresses</h2>
    <div class="scrollable-box">
    `;

    // populate authorized addresses list
    ballot.authorizedAddresses.forEach((address) => {
        content += `
        <div class="item">
            ${address}
        </div>
        `;
    });

    content += `
    </div>

    <!-- Details -->
    <h2>Details</h2>
    <div>
        <p><strong>Address:</strong> ${ballot.address}</p>
        <p><strong>Winner(s):</strong> ${ballot.winners}</p>
        <p><strong>Started:</strong> ${ballot.startTime}</p>
        <p><strong>Ends:</strong> ${ballot.endTime}</p>
        <p><strong>Authorized Voters:</strong> ${ballot.authorizedAddresses.length}</p>
        <p><strong>Total Votes:</strong> ${ballot.totalVotes}</p>
        <p><strong>Proposals:</strong> ${proposals.length}</p>
    </div>
    `;

    // add Back button
    content += `</div><button class="button" id="backButton">Back</button>
    `;

    ballotDetailsContent.innerHTML = content;
    contentContainer.innerHTML = '';
    contentContainer.appendChild(ballotDetailsContent);

    // configure Back button
    document.getElementById("backButton").onclick = myBallotsTabClick;

    // configure → buttons if the ballot hasn't expired
    if (!expired) {
        document.getElementById("authorizeArrowButton").onclick = () => authorizeArrowButtonClick(item);
        document.getElementById("revokeArrowButton").onclick = () => revokeArrowClick(item);
        document.getElementById("newProposalArrowButton").onclick = () => newProposalArrowClick(item);
    }
}

async function authorizeArrowButtonClick(item) {

    // retrieve data
    const authorizeInput = document.getElementById("authorizeInput");
    const voterAddress = authorizeInput.value;
    const ballotAddress = item.getAttribute('data-address');

    // check if voter is already authorized
    const ballot = await loadBallotDetails(ballotAddress);
    if (ballot.authorizedAddresses.includes(voterAddress)) {
        alert('Address is already authorized.');
        return;
    }
    
    // validate input
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(voterAddress);
    if (!isValidAddress) {
        alert('Please enter a valid Ethereum address.');
        return;
    }

    // authorize address
    await authorizeVoter(voterAddress, ballotAddress);

    // TODO: show an error message if the voter is already authorized

    // clear input
    authorizeInput.value = "";

    // refresh lists
    await displayBallotDetails(item);
}

async function revokeArrowClick(item) {

    // retrieve data
    const revokeInput = document.getElementById("revokeInput");
    const voterAddress = revokeInput.value;
    const ballotAddress = item.getAttribute('data-address');

    // validate input
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(voterAddress);
    if (!isValidAddress) {
        alert('Please enter a valid Ethereum address.');
        return;
    }

    // revoke voter
    await revokeVoter(voterAddress, ballotAddress);

    // clear input
    revokeInput.value = '';

    // refresh lists
    await displayBallotDetails(item);
}

async function newProposalArrowClick(item) {

    // retrieve data
    const newProposalInput = document.getElementById("newProposalInput").value;
    const ballotAddress = item.getAttribute('data-address');

    const isValidInput = /^[A-Za-z0-9\s]+$/.test(newProposalInput.trim()) && newProposalInput.trim().length > 0;
    if (!isValidInput) {
        alert('Proposal can only contain letters, numbers, and spaces, and cannot be whitespace.');
        return;
    }

    // add proposal
    await addProposal(newProposalInput, ballotAddress);

    // refresh lists
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
        await electioneer.methods.createBallot(ballotName, duration).send({ from: userAddress });
        alert('Ballot created successfully!');
    } catch (error) {
        console.error('Error creating ballot:', error);
        alert('Failed to create ballot.');
    }

    myBallotsTab.click();
}