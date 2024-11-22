import { loadBallots, userAccount } from '../ethereum.js';
import { activateTab } from '../helpers.js';

const contentContainer = document.getElementById("content");

export async function authorizedTabClick() {
    activateTab(document.getElementById('authorizedTab'));

    // Create a new element for authorized content
    const authroizedContent = document.createElement('div');
    authroizedContent.classList.add('content');
    
    // load ballots
    const ballots = await loadBallots();
    const myBallots = [];

    // filter ballots
    for (const ballot of ballots) {        
        if (ballot.authorizedVoters.some(voter => voter.toLowerCase() === userAccount.toLowerCase())) {
            myBallots.push({
                address: ballot.address,
                name: ballot.name,
                owner: ballot.owner,
            });
        }
    }

    // populate ballot list
    let content = '<div class="scrollable-box"><div class="item-list">';
    for (const ballot of myBallots) {
        content += `
            <div class="item" data-address="${ballot.address}">
                <span>${ballot.name}</span>
                <span class="subscript">${ballot.address}</span>
            </div>
        `;
    }
    content += `
        </div></div>
    `;

    authroizedContent.innerHTML = content;

    // configure ballot clicks
    authroizedContent.addEventListener('click', (event) => {

        // check if the clicked element is a ballot item
        if (event.target.closest('.item')) {
            const item = event.target.closest('.item');
            displayBallotVoting(item);
        }
    });

    contentContainer.innerHTML = '';
    contentContainer.appendChild(authroizedContent);
}

function displayBallotVoting(item) {
    const ballotAddress = item.getAttribute('data-address');

    // Create a new element for voting content
    const votingContent = document.createElement('div');
    votingContent.classList.add('content');
    
    // populate input fields
    let content = `
    <h2>${item.querySelector('span').textContent}</h2>
    
    <!-- Vote Input Field -->
    <div class="input-field">
        <label for="voteInput">Vote</label>
        <input type="text" id="voteInput">
        <button id="voteArrowButton" class="input-arrow">→</button>
    </div>

    <!-- Delegate Input Field -->
    <div class="input-field">
        <label for="delegateInput">Delegate</label>
        <input type="text" id="delegateInput">
        <button id="delegateArrowButton" class="input-arrow">→</button>
    </div>
    
    <!-- Proposals List -->
    <h2>Proposals</h2>
    <div class="scrollable-box">
    </div>

    <!-- Back Button -->
    <button class="button" id="backButton">Back</button>
    `;

    votingContent.innerHTML = content;
    contentContainer.innerHTML = '';
    contentContainer.appendChild(votingContent);

    // configure Back button
    document.getElementById("backButton").onclick = authorizedTabClick;

    // configure → buttons
    document.getElementById("voteArrowButton").onclick = () => voteArrowButtonClick(ballotAddress);
    document.getElementById("delegateArrowButton").onclick = () => delegateArrowClick(ballotAddress);    
}

// TODO: implement
function voteArrowButtonClick(ballotAddress) {
    const voteInput = document.getElementById("voteInput").value;
}

// TODO: implement
function delegateArrowClick(ballotAddress) {
    const delegateInput = document.getElementById("delegateInput").value;
}
