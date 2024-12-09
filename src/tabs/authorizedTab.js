import { loadBallots, getProposals, loadBallotDetails, vote, getVoterProposalName, getProposalVoters, userAddress } from '../ethereum.js';
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
        if (ballot.authorizedAddresses.some(voter => voter.toLowerCase() === userAddress.toLowerCase())) {
            myBallots.push(ballot);
        }
    }

    // sort so the ballots with the latest expiration date are at the top
    myBallots.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    // populate ballot list
    let content = '<div class="scrollable-box"><div class="item-list">';
    for (const ballot of myBallots) {

        // returns "N/A" if the voter has not voted
        const voterProposalName = await getVoterProposalName(userAddress, ballot.address);
        const statusIcon = voterProposalName == "N/A"
        ? '<span class="item-icon not-voted">○</span>'
        : '<span class="item-icon voted">✔</span>';
    
        // add the 'expired' class if the ballot is over
        const currentTime = new Date();
        const endDate = new Date(ballot.endTime);
        const expiredClass = endDate < currentTime ? 'expired' : '';

        content += `
            <div class="item ${expiredClass}" data-address="${ballot.address}">
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

    // check the proposal voted on by the user
    const voterProposalName = await getVoterProposalName(userAddress, ballotAddress);

    // check if the ballot is active
    const currentTime = new Date();
    const endDate = new Date(ballot.endTime);
    const isBallotActive = endDate > currentTime;
    
    // populate input fields
    let content = `
    <!-- Ballot Name -->
    <h2>${ballot.name}</h2>
    
    <!-- Proposals List -->
    <h2>Proposals</h2>
    <div class="scrollable-box" id="proposalList">
    `;

    // populate proposal list with names and votes
    for (let i = 0; i < proposals.length; i++) {
        const proposalName = proposals[i].name;
        const voteCount = proposals[i].voteCount;

        content += `
        <div class="item">
            <span>${proposalName}</span>
            ${
                isBallotActive // only display proposal votes if the ballot is over
                    ? ''
                    : `<span class="subscript">Votes: ${voteCount}</span>`
            }
        </div>
        `;
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
        ${
            isBallotActive // only display vote count if the ballot is over
                ? ''
                : `<p><strong>Total Votes:</strong> ${ballot.totalVotes}</p>` 
        }
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

    contentContainer.innerHTML = '';
    contentContainer.appendChild(votingContent);

    // configure proposal clicks for voting if ballot is active
    let selectedProposal = null;
    if (isBallotActive) {

        // if the user has not voted
        if (voterProposalName == "N/A") {
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
        }
        // if the user has voted
        else {
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
    }
    // configure proposal clicks to view voters if ballot is over
    else {
        const proposalItems = document.querySelectorAll('#proposalList .item');
        proposalItems.forEach((proposalItem, index) => {
            proposalItem.onclick = () => {
                proposalClick(proposals[index], ballotAddress, ballotItem);
            };
        });
    }
        
    // configure buttons
    document.getElementById("backButton").onclick = authorizedTabClick;
    document.getElementById("voteButton").onclick = () => voteButtonClick(selectedProposal.innerText, ballotItem);
}

async function proposalClick(proposal, ballotAddress, item) {
    const voters = await getProposalVoters(proposal.id, ballotAddress);

    // create a new element for proposal voters content
    const proposalVotersContent = document.createElement('div');
    proposalVotersContent.classList.add('content');

    let content = `<h2>${proposal.name}</h2>`;

    content += `
    <!-- Voters List -->
    <h2>Voters</h2>
    <div class="scrollable-box" id="votersList">
    `;

    // populate voters list with addresses
    voters.forEach(voter => {
        content += `
            <div class="item">
                <span>${voter}</span>
            </div>
        `;
    });
    content += `
        </div>
    `;

    // add Back button
    content += `</div><button class="button" id="backButton">Back</button>
    `;

    proposalVotersContent.innerHTML = content;
    contentContainer.innerHTML = '';
    contentContainer.appendChild(proposalVotersContent);

    // configure Back button
    document.getElementById("backButton").onclick = () => displayBallotDetails(item);
}

async function voteButtonClick(proposalName, ballot) {
    const ballotAddress = ballot.getAttribute('data-address');
    await vote(proposalName, ballotAddress);

    // refresh display
    displayBallotDetails(ballot);
}