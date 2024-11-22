import { loadBallots, getProposals, vote, userAccount } from '../ethereum.js';
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

async function displayBallotVoting(item) {
    const ballotAddress = item.getAttribute('data-address');

    // create a new element for voting content
    const votingContent = document.createElement('div');
    votingContent.classList.add('content');

    // load proposals
    const proposals = await getProposals(ballotAddress);
    const proposalNames = proposals.map(proposal => proposal.name);
    
    // populate input fields
    let content = `
    <!-- Ballot Name -->
    <h2>${item.querySelector('span').textContent}</h2>
    
    <!-- Proposals List -->
    <h2>Proposals</h2>
    <div class="scrollable-box">
    `;

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

    // add buttons
    content += `
    </div>

    <!-- Back and Vote Buttons -->
    <div>
        <button class="button" id="backButton">Back</button>
        <button class="button" id="voteButton">Vote</button>
    </div>
    `;
    
    votingContent.innerHTML = content;

    // disable Vote button
    const voteButton = votingContent.querySelector('#voteButton');
    voteButton.disabled = true;

    let selectedItem = null;

    // configure proposal clicks
    votingContent.addEventListener('click', (event) => {
        const item = event.target.closest('.item');
        if (item) {

            // remove highlighting from all proposals
            document.querySelectorAll('.item.selected').forEach((element) => {
                element.classList.remove('selected');
            });

            // highlight selected proposal
            item.classList.add('selected');

            selectedItem = item;

            // enable Vote button
            const voteButton = document.getElementById('voteButton');
            voteButton.disabled = false;
        }
    });
    
    contentContainer.innerHTML = '';
    contentContainer.appendChild(votingContent);

    // configure buttons
    document.getElementById("backButton").onclick = authorizedTabClick;
    document.getElementById("voteButton").onclick = () => vote(selectedItem.innerText, ballotAddress);
}
