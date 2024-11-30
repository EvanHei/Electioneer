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
    string public name;
    uint public totalProposals;
    uint public totalVotes;
    uint public startTime;
    uint public endTime;
    address[] public voterAddresses;

    mapping(uint => Proposal) public proposals;
    mapping(address => Voter) public voters;

    event BallotStarted(string name, uint startTime, uint endTime);
    event ProposalRegistered(uint id, string name);
    event VoterAuthorized(address voter);
    event VoterRevoked(address voter);
    event Voted(address voter, uint proposalId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    modifier isAuthorized() {
        require(voters[msg.sender].authorized, "Voter is not authorized");
        _;
    }

    constructor(string memory _name, uint _durationInMinutes, address _owner) {
        owner = _owner;
        name = _name;
        startTime = block.timestamp;
        endTime = startTime + (_durationInMinutes * 1 minutes);
        emit BallotStarted(_name, startTime, endTime);
    }

    // proposals can represent a candidate, bill, law, etc.
    function registerProposal(string memory _name) external onlyOwner {
        require(isActive(), "Ballot has ended");

        // disallow duplicate names
        for (uint i = 1; i <= totalProposals; i++) {
            require(
                keccak256(abi.encodePacked(proposals[i].name)) !=
                    keccak256(abi.encodePacked(_name)),
                "Proposal name already exists"
            );
        }

        totalProposals++;
        proposals[totalProposals] = Proposal(totalProposals, _name, 0);
        emit ProposalRegistered(totalProposals, _name);
    }

    function authorizeVoter(address _voter) external onlyOwner {
        require(isActive(), "Ballot has ended");
        require(!voters[_voter].authorized, "Voter is already authorized");

        // add voter to list if not already
        bool inList = false;
        for (uint i = 0; i < voterAddresses.length; i++) {
            if (voterAddresses[i] == _voter) {
                inList = true;
                break;
            }
        }
        if (!inList) {
            voterAddresses.push(_voter);
        }

        voters[_voter].authorized = true;
        emit VoterAuthorized(_voter);
    }

    function revokeVoter(address _voter) external onlyOwner {
        require(isActive(), "Ballot has ended");
        require(voters[_voter].authorized, "Voter is not authorized");

        // Decrement vote
        if (voters[_voter].voted) {
            uint proposalId = voters[_voter].proposalId;
            require(
                proposalId > 0 && proposalId <= totalProposals,
                "Invalid proposal ID"
            );
            proposals[proposalId].voteCount--;
        }

        // Revoke authorization
        voters[_voter].authorized = false;
        voters[_voter].voted = false;
        emit VoterRevoked(_voter);
    }

    function vote(uint _proposalId) external isAuthorized {
        require(!voters[msg.sender].voted, "Already voted");
        require(
            _proposalId > 0 && _proposalId <= totalProposals,
            "Invalid proposal ID"
        );
        require(isActive(), "Ballot has ended");

        voters[msg.sender].voted = true;
        voters[msg.sender].proposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        totalVotes++;
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

    function getProposalVoters(
        uint _proposalId
    ) external view returns (address[] memory) {
        require(
            _proposalId > 0 && _proposalId <= totalProposals,
            "Invalid proposal ID"
        );

        // count the number of proposal votes
        uint votersCount = 0;
        for (uint i = 0; i < voterAddresses.length; i++) {
            if (
                voters[voterAddresses[i]].voted &&
                voters[voterAddresses[i]].proposalId == _proposalId
            ) {
                votersCount++;
            }
        }

        // populate an array to store addresses
        address[] memory proposalVoters = new address[](votersCount);
        uint index = 0;
        for (uint i = 0; i < voterAddresses.length; i++) {
            if (
                voters[voterAddresses[i]].voted &&
                voters[voterAddresses[i]].proposalId == _proposalId
            ) {
                proposalVoters[index] = voterAddresses[i];
                index++;
            }
        }

        return proposalVoters;
    }

    function getWinners() external view returns (string memory winners) {
        require(!isActive(), "Ballot is still active");
        require(totalProposals > 0, "No proposals registered");
        require(totalVotes > 0, "No votes have been cast");

        uint winningVoteCount = 0;
        string memory separator = ", ";

        // Find the highest vote count
        for (uint i = 1; i <= totalProposals; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
            }
        }

        // Collect all proposals with the highest vote count
        for (uint i = 1; i <= totalProposals; i++) {
            if (proposals[i].voteCount == winningVoteCount) {
                if (bytes(winners).length > 0) {
                    winners = string(
                        abi.encodePacked(winners, separator, proposals[i].name)
                    );
                } else {
                    winners = proposals[i].name;
                }
            }
        }
    }

    function isActive() public view returns (bool) {
        return block.timestamp < endTime;
    }

    function getAuthorizedAddresses() public view returns (address[] memory) {
        // count the number of authorized voters
        uint authorizedCount = 0;
        for (uint i = 0; i < voterAddresses.length; i++) {
            if (voters[voterAddresses[i]].authorized) {
                authorizedCount++;
            }
        }

        // array to store authorized addresses
        address[] memory authorizedAddresses = new address[](authorizedCount);
        uint index = 0;

        // fill the array with authorized voters
        for (uint i = 0; i < voterAddresses.length; i++) {
            if (voters[voterAddresses[i]].authorized) {
                authorizedAddresses[index] = voterAddresses[i];
                index++;
            }
        }

        return authorizedAddresses;
    }
}
