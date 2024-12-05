import { loadBallots } from '../ethereum.js';
import { activateTab } from '../helpers.js';

const contentContainer = document.getElementById("content");

export async function allTabClick() {
    activateTab(document.getElementById('allTab'));

    // load and sort so the ballots with the latest expiration date are at the top
    const ballots = await loadBallots();
    ballots.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    let content = `
        <!-- Search Bar -->
        <div class="input-field">
            <input type="text" id="searchBar" placeholder="Search" />
        </div>

        <!-- Ballot List -->
        <div id="ballotList" class="scrollable-box"><div class="item-list">
    `;

    for (const ballot of ballots) {
        
        // add the 'expired' class if the ballot is over
        const currentTime = new Date();
        const endDate = new Date(ballot.endTime);
        const expiredClass = endDate < currentTime ? 'expired' : '';
        
        content += `
            <div class="item ${expiredClass}" data-address="${ballot.address}">
                <span>${ballot.name}</span>
                <span class="subscript">Ends ${ballot.endTime}</span>
            </div>
        `;
    }
    content += '</div></div>';

    contentContainer.innerHTML = content;

    // configure Search bar
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('input', () => searchBarInputUpdate(ballots));
}

function searchBarInputUpdate(ballots) {
    const searchQuery = document.getElementById('searchBar').value.toLowerCase();
    const ballotListContainer = document.getElementById('ballotList');

    // filter ballots based on search query
    const filteredBallots = ballots.filter(ballot =>
        ballot.name.toLowerCase().includes(searchQuery)
    );

    // sort so the ballots with the latest expiration date are at the top
    filteredBallots.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    let filteredContent = '<div class="item-list">';
    for (const ballot of filteredBallots) {
        const currentTime = new Date();
        const endDate = new Date(ballot.endTime);
        const expiredClass = endDate < currentTime ? 'expired' : '';

        filteredContent += `
            <div class="item ${expiredClass}" data-address="${ballot.address}">
                <span>${ballot.name}</span>
                <span class="subscript">Ends ${ballot.endTime}</span>
            </div>
        `;
    }

    filteredContent += '</div>';
    ballotListContainer.innerHTML = filteredContent;
}