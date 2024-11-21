import { loadBallots, userAccount } from '../ethereum.js';
import { activateTab } from '../helpers.js';

const contentContainer = document.getElementById("content");

export async function authorizedTabClick() {
    activateTab(document.getElementById('authorizedTab'));
    
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

    contentContainer.innerHTML = content;
}
