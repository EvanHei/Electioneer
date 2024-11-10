import { activateTab } from '../helpers.js';

const contentContainer = document.getElementById("content");

export async function authorizedTabClick() {
    activateTab(document.getElementById('authorizedTab'));
    contentContainer.innerHTML = `<p>Loading...</p>`;
    // Logic for loading and displaying authorized ballots goes here
}
