import { loadBallots } from '../ethereum.js';
import { activateTab } from '../helpers.js';

const contentContainer = document.getElementById("content");

export async function allTabClick() {
    activateTab(document.getElementById('allTab'));

    // TODO: add a search bar here

    const ballots = await loadBallots();

    // sort so the ballots with the latest expiration date are at the top
    ballots.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    let content = '<div class="scrollable-box"><div class="item-list">';
    for (const ballot of ballots) {
        content += `
            <div class="item" data-address="${ballot.address}">
                ${ballot.name}
                <span class="subscript">Ends ${ballot.endTime}</span>
            </div>
        `;
    }
    content += '</div></div>';

    contentContainer.innerHTML = content;
}
