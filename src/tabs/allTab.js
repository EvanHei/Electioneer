import { loadBallots } from '../ethereum.js';
import { activateTab } from '../helpers.js';

const contentContainer = document.getElementById("content");

export async function allTabClick() {
    activateTab(document.getElementById('allTab'));

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