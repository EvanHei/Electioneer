import { loadContract, connectToEthereum, loadBallots, electioneer, userAccount } from './ethereum.js';
const contentContainer = document.getElementById("content");

// Bind UI events to functions
function bindUIEvents() {
    var allTab = document.getElementById('allTab');
    var myBallotsTab = document.getElementById('myBallotsTab');
    var authorizedTab = document.getElementById('authorizedTab');

    allTab.onclick = allTabClick;
    myBallotsTab.onclick = myBallotsTabClick;
    authorizedTab.onclick = authorizedTabClick;
}

// Initialize the web app
window.addEventListener("load", async () => {
    await connectToEthereum();
    await loadContract();
    bindUIEvents();
    allTab.click();
});

async function allTabClick() {
    // TODO: refactor into a separate method
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    allTab.classList.add('active');

    // Load ballots
    const ballots = await loadBallots();
    let content = '<div class="item-list">';
    for (const ballot of ballots) {
        content += `
            <div class="item">
                ${ballot.name}
                <span class="subscript">${ballot.address}</span>
            </div>
        `;
    }
    content += '</div>';

    contentContainer.innerHTML = content;
}

async function myBallotsTabClick() {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    myBallotsTab.classList.add('active');
        
    // Load only the user's ballots
    const ballots = await loadBallots();
    const myBallots = [];
    for (const ballot of ballots) {
        if (ballot.owner.toLowerCase() === userAccount.toLowerCase()) {
            myBallots.push({
                name: ballot.name,
                address: ballot.address
            });
        }
    }
    
    // Generate content for my ballots
    let content = '<div class="item-list">';
    for (const ballot of myBallots) {
        content += `
        <div class="item">
        ${ballot.name}
        <span class="subscript">${ballot.address}</span>
        </div>
        `;
    }
    content += '</div>';

    // Configure Create button
    content += '<button id="createButton">Create</button>';
    contentContainer.innerHTML = content;
    const createButton = document.getElementById("createButton");
    createButton.onclick = createButtonClick;
}

async function authorizedTabClick() {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    authorizedTab.classList.add('active');

    // Load content
    const content = `Loading...`;
  
    contentContainer.innerHTML = content;
}

async function createButtonClick() {
    // Get input
    const ballotName = window.prompt('Enter ballot name:');
    const durationInMinutes = window.prompt('Enter duration in minutes:');
    
    // Validate
    if (!ballotName || !durationInMinutes) {
        alert('Please enter both ballot name and duration.');
        return;
    }
    const duration = parseInt(durationInMinutes, 10);

    // Create ballot
    try {
        await electioneer.methods.createBallot(ballotName, duration).send({ from: userAccount });
        alert('Ballot created successfully!');
    } catch (error) {
        console.error('Error creating ballot:', error);
        alert('Failed to create ballot.');
    }
}