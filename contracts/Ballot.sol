// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Ballot {
    struct Proposal {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool authorized;
        bool voted;
        uint proposalId;
    }

    address public owner;
    string public ballotName;
    bool public ballotActive;
    uint public totalProposals;
    uint public startTime;
    uint public endTime;

    mapping(uint => Proposal) public proposals;
    mapping(address => Voter) public voters;

    event BallotStarted(string name, uint startTime, uint endTime);
    event ProposalRegistered(uint id, string name);
    event VoterAuthorized(address voter);
    event VoterAuthorizationRevoked(address voter);
    event Voted(address voter, uint proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    modifier ballotIsActive() {
        require(block.timestamp >= startTime, "Ballot has not started yet");
        require(block.timestamp <= endTime, "Ballot has ended");
        require(ballotActive, "Ballot is not active");
        _;
    }

    modifier isAuthorized() {
        require(voters[msg.sender].authorized, "Voter is not authorized");
        _;
    }

    constructor(
        string memory _ballotName,
        uint _durationInMinutes,
        address _owner
    ) {
        owner = _owner;
        ballotName = _ballotName;
        startTime = block.timestamp;
        endTime = startTime + (_durationInMinutes * 1 minutes);
        ballotActive = true;
        emit BallotStarted(_ballotName, startTime, endTime);
    }

    // proposals can represent a candidate, bill, law, etc.
    function registerProposal(string memory _name) external onlyOwner {
        totalProposals++;
        proposals[totalProposals] = Proposal(totalProposals, _name, 0);
        emit ProposalRegistered(totalProposals, _name);
    }

    function authorizeVoter(address _voter) external onlyOwner {
        voters[_voter].authorized = true;
        emit VoterAuthorized(_voter);
    }

    function revokeVoterAuthorization(address _voter) external onlyOwner {
        require(voters[_voter].authorized, "Voter is not authorized");

        // decrement vote
        if (voters[_voter].voted) {
            uint proposalId = voters[_voter].proposalId;
            require(
                proposalId > 0 && proposalId <= totalProposals,
                "Invalid proposal ID"
            );
            proposals[proposalId].voteCount--;
        }

        // revoke authorization
        voters[_voter].authorized = false;
        voters[_voter].voted = false;
        emit VoterAuthorizationRevoked(_voter);
    }

    function vote(uint _proposalId) external ballotIsActive isAuthorized {
        require(!voters[msg.sender].voted, "Already voted");
        require(
            _proposalId > 0 && _proposalId <= totalProposals,
            "Invalid proposal ID"
        );

        voters[msg.sender].voted = true;
        voters[msg.sender].proposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    function getProposalById(
        uint _proposalId
    ) public view returns (Proposal memory) {
        require(
            _proposalId > 0 && _proposalId <= totalProposals,
            "Invalid proposal ID"
        );
        return proposals[_proposalId];
    }

    function getProposals() external view returns (Proposal[] memory) {
        Proposal[] memory proposalList = new Proposal[](totalProposals);
        for (uint i = 1; i <= totalProposals; i++) {
            proposalList[i - 1] = proposals[i];
        }
        return proposalList;
    }

    function getWinner()
        external
        view
        returns (string memory winnerName, uint voteCount)
    {
        require(!ballotActive, "Ballot is still active");

        uint winningVoteCount = 0;
        uint winningProposalId = 0;

        for (uint i = 1; i <= totalProposals; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        winnerName = proposals[winningProposalId].name;
        voteCount = proposals[winningProposalId].voteCount;
    }

    function timeRemaining() external view returns (uint) {
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }
}
