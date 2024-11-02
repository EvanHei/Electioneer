// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Electioneer {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool authorized;
        bool voted;
        uint candidateId;
    }

    address public owner;
    string public electionName;
    bool public electionActive;
    uint public totalCandidates;
    uint public startTime;
    uint public endTime;

    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event ElectionStarted(string name, uint startTime, uint endTime);
    event CandidateRegistered(uint id, string name);
    event VoterAuthorized(address voter);
    event VoterAuthorizationRevoked(address voter);
    event Voted(address voter, uint candidateId);

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

    function registerCandidate(string memory _name) public onlyOwner {
        totalCandidates++;
        candidates[totalCandidates] = Candidate(totalCandidates, _name, 0);
        emit CandidateRegistered(totalCandidates, _name);
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

    function vote(uint _candidateId) public electionIsActive isAuthorized {
        require(!voters[msg.sender].voted, "Already voted");
        require(
            _candidateId > 0 && _candidateId <= totalCandidates,
            "Invalid candidate ID"
        );

        voters[msg.sender].voted = true;
        voters[msg.sender].candidateId = _candidateId;
        candidates[_candidateId].voteCount++;
        emit Voted(msg.sender, _candidateId);
    }

    function getCandidateById(
        uint _candidateId
    ) public view returns (Candidate memory) {
        require(
            _candidateId > 0 && _candidateId <= totalCandidates,
            "Invalid candidate ID"
        );
        return candidates[_candidateId];
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](totalCandidates);
        for (uint i = 1; i <= totalCandidates; i++) {
            candidateList[i - 1] = candidates[i];
        }
        return candidateList;
    }

    function getWinner()
        public
        view
        returns (string memory winnerName, uint voteCount)
    {
        require(!electionActive, "Election is still active");

        uint winningVoteCount = 0;
        uint winningCandidateId = 0;

        for (uint i = 1; i <= totalCandidates; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        winnerName = candidates[winningCandidateId].name;
        voteCount = candidates[winningCandidateId].voteCount;
    }

    function timeRemaining() public view returns (uint) {
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }
}
