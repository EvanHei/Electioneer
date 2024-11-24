// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Ballot.sol";

contract Electioneer {
    address[] public ballots;

    event BallotCreated(
        address ballotAddress,
        string ballotName,
        address owner
    );

    function createBallot(
        string memory _ballotName,
        uint _durationInMinutes
    ) external {
        Ballot newBallot = new Ballot(
            _ballotName,
            _durationInMinutes,
            msg.sender
        );
        ballots.push(address(newBallot));
        emit BallotCreated(address(newBallot), _ballotName, msg.sender);
    }

    function getBallotAddresses() public view returns (address[] memory) {
        return ballots;
    }
}
