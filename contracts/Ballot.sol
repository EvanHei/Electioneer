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
    string public electionName;
    bool public electionActive;
    uint public totalProposals;
    uint public startTime;
    uint public endTime;

    mapping(uint => Proposal) public proposals;
    mapping(address => Voter) public voters;

    event ElectionStarted(string name, uint startTime, uint endTime);
    event ProposalRegistered(uint id, string name);
    event VoterAuthorized(address voter);
    event VoterAuthorizationRevoked(address voter);
    event Voted(address voter, uint proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    modifier electionIsActive() {
        require(block.timestamp >= startTime, "Election has not started yet");
        require(block.timestamp <= endTime, "Election has ended");
        require(electionActive, "Election is not active");
        _;
    }

    modifier isAuthorized() {
        require(voters[msg.sender].authorized, "Voter is not authorized");
        _;
    }

    constructor(
        string memory _electionName,
        uint _durationInMinutes,
        address _owner
    ) {
        owner = _owner;
        electionName = _electionName;
        startTime = block.timestamp;
        endTime = startTime + (_durationInMinutes * 1 minutes);
        electionActive = true;
        emit ElectionStarted(_electionName, startTime, endTime);
    }

    function registerProposal(string memory _name) public onlyOwner {
        totalProposals++;
        proposals[totalProposals] = Proposal(totalProposals, _name, 0);
        emit ProposalRegistered(totalProposals, _name);
    }

    function authorizeVoter(address _voter) public onlyOwner {
        voters[_voter].authorized = true;
        emit VoterAuthorized(_voter);
    }

    function revokeVoterAuthorization(address _voter) public onlyOwner {
        require(voters[_voter].authorized, "Voter is not authorized");
        require(!voters[_voter].voted, "Voter has already voted");
        voters[_voter].authorized = false;
        emit VoterAuthorizationRevoked(_voter);
    }

    function vote(uint _proposalId) public electionIsActive isAuthorized {
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

    function getProposals() public view returns (Proposal[] memory) {
        Proposal[] memory proposalList = new Proposal[](totalProposals);
        for (uint i = 1; i <= totalProposals; i++) {
            proposalList[i - 1] = proposals[i];
        }
        return proposalList;
    }

    function getWinner()
        public
        view
        returns (string memory winnerName, uint voteCount)
    {
        require(!electionActive, "Election is still active");

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

    function timeRemaining() public view returns (uint) {
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }
}
