import { connectToEthereum, loadContract } from './ethereum.js';
import { allTabClick } from './tabs/allTab.js';
import { myBallotsTabClick } from './tabs/myBallotsTab.js';
import { authorizedTabClick } from './tabs/authorizedTab.js';

window.addEventListener("load", async () => {
    await connectToEthereum();
    await loadContract();
    bindUIEvents();
    document.getElementById("allTab").click();
});

function bindUIEvents() {
    document.getElementById("allTab").onclick = allTabClick;
    document.getElementById("myBallotsTab").onclick = myBallotsTabClick;
    document.getElementById("authorizedTab").onclick = authorizedTabClick;
}
