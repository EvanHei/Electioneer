// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Electioneer.sol";

contract ElectioneerFactory {
    address[] public elections;

    event ElectionCreated(
        address electionAddress,
        string electionName,
        address owner
    );

    function createElection(
        string memory _electionName,
        uint _durationInMinutes
    ) public {
        Electioneer newElection = new Electioneer(
            _electionName,
            _durationInMinutes,
            msg.sender
        );
        elections.push(address(newElection));
        emit ElectionCreated(address(newElection), _electionName, msg.sender);
    }

    function getElections() public view returns (address[] memory) {
        return elections;
    }
}
