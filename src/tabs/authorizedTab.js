import { loadBallots, getProposals, loadBallotDetails, vote, getVoterProposalName, userAccount } from '../ethereum.js';
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
        if (ballot.authorizedAddresses.some(voter => voter.toLowerCase() === userAccount.toLowerCase())) {
            myBallots.push(ballot);
        }
    }

    // populate ballot list
    let content = '<div class="scrollable-box"><div class="item-list">';
    for (const ballot of myBallots) {

        // returns "N/A" if the voter has not voted
        const voterProposalName = await getVoterProposalName(userAccount, ballot.address);
        const statusIcon = voterProposalName == "N/A"
        ? '<span class="status-icon not-voted">○</span>'
        : '<span class="status-icon voted">✔</span>';

        content += `
            <div class="item" data-address="${ballot.address}">
                <span>${ballot.name} ${statusIcon}</span>
                
                <span class="subscript">Ends ${ballot.endTime}</span>
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
            const ballot = event.target.closest('.item');
            displayBallotDetails(ballot);
        }
    });

    contentContainer.innerHTML = '';
    contentContainer.appendChild(authroizedContent);
}

async function displayBallotDetails(ballotItem) {
    const ballotAddress = ballotItem.getAttribute('data-address');
    const ballot = await loadBallotDetails(ballotAddress);

    // create a new element for voting content
    const votingContent = document.createElement('div');
    votingContent.classList.add('content');

    // load proposals
    const proposals = await getProposals(ballotAddress);
    const proposalNames = proposals.map(proposal => proposal.name);

    // check the proposal voted by the user
    const voterProposalName = await getVoterProposalName(userAccount, ballotAddress);
    
    // populate input fields
    let content = `
    <!-- Ballot Name -->
    <h2>${ballot.name}</h2>
    
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

    // populate details
    content += `
    </div>

    <!-- Details -->
    <h2>Details</h2>
    <div>
        <p><strong>Winner(s):</strong> ${ballot.winners}</p>
        <p><strong>Your Vote:</strong> ${voterProposalName}</p>
        <p><strong>Ends:</strong> ${ballot.endTime}</p>
    </div>
    `;

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

    let selectedProposal = null;

    // configure proposal clicks
    votingContent.addEventListener('click', (event) => {
        const proposal = event.target.closest('.item');
        if (proposal) {
            // remove highlighting from all proposals
            document.querySelectorAll('.item.selected').forEach((element) => {
                element.classList.remove('selected');
            });

            // highlight selected proposal
            proposal.classList.add('selected');

            selectedProposal = proposal;

            // enable Vote button
            voteButton.disabled = false;
        }
    });

    contentContainer.innerHTML = '';
    contentContainer.appendChild(votingContent);

    // disable clicking if the voter already voted or if the ballot is over
    const currentTime = new Date();
    const endDate = new Date(ballot.endTime);
    if (voterProposalName !== "N/A" || endDate < currentTime) {
        document.querySelectorAll('.item').forEach((item) => {

            // disable clicking
            item.classList.add('disabled');
            voteButton.disabled = true;

            // highlight the voted proposal
            if (item.textContent.trim() === voterProposalName) {
                item.classList.add('selected');
            }
        });
    }
    
    // configure buttons
    document.getElementById("backButton").onclick = authorizedTabClick;
    document.getElementById("voteButton").onclick = () => voteButtonClick(selectedProposal.innerText, ballotItem);
}

async function voteButtonClick(proposalName, ballot) {
    const ballotAddress = ballot.getAttribute('data-address');
    await vote(proposalName, ballotAddress);

    // refresh display
    displayBallotDetails(ballot);
}