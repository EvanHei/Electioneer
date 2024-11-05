import { loadContract, connectToEthereum, electioneer, userAccount } from './ethereum.js';

// Bind UI events to functions
function bindUIEvents() {
    var allTab = document.getElementById('allTab');
    var myBallotsTab = document.getElementById('myBallotsTab');
    var authorizedTab = document.getElementById('authorizedTab');
    var createButton = document.getElementById('createButton');

    allTab.onclick = function() {
        showAllTab();
    };
    myBallotsTab.onclick = function() {
        showMyBallotsTab();
    };
    authorizedTab.onclick = function() {
        showAuthorizedTab();
    };
}

// Initialize the web app
window.addEventListener("load", async () => {
    await connectToEthereum();
    await loadContract();
    bindUIEvents();
    allTab.click();
});

async function showAllTab() {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    allTab.classList.add('active');

    // Load content
    // TODO: replace with actual ballots
    const content = `
      <div class="item-list">
          <div class="item">
              Item 1
              <span class="subscript">Subscript 1</span>
          </div>
          <div class="item">
              Item 2
              <span class="subscript">Subscript 2</span>
          </div>
          <div class="item">
              Item 3
              <span class="subscript">Subscript 3</span>
          </div>
          <div class="item">
              Item 4
              <span class="subscript">Subscript 4</span>
          </div>
          <div class="item">
              Item 5
              <span class="subscript">Subscript 5</span>
          </div>
      </div>
    `;
  
    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = content;
}

async function showMyBallotsTab() {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    myBallotsTab.classList.add('active');
    
    // Load content
    const contentContainer = document.getElementById("content");
    const content = `<button id="createButton">Create</button>`;
    contentContainer.innerHTML = content;

    const createButton = document.getElementById("createButton");
    createButton.onclick = async function() {
        const ballotName = window.prompt('Enter ballot name:');
        const durationInMinutes = window.prompt('Enter duration in minutes:');

        if (!ballotName || !durationInMinutes) {
            alert('Please enter both ballot name and duration.');
            return;
        }

        const duration = parseInt(durationInMinutes, 10);

        try {
            await electioneer.methods.createBallot(ballotName, duration).send({ from: userAccount });
            alert('Ballot created successfully!');
        } catch (error) {
            console.error('Error creating ballot:', error);
            alert('Failed to create ballot.');
        }
    };
}

async function showAuthorizedTab() {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    authorizedTab.classList.add('active');

    // Load content
    const content = `Loading...`;
  
    const contentContainer = document.getElementById("content");
    contentContainer.innerHTML = content;
}
