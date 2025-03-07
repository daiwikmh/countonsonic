// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 private count;
    address public owner;

    event CounterIncreased(uint256 newValue, address incrementor);

    constructor() {
        count = 0;
        owner = msg.sender;
    }

    function increment() public {
        count++;
        emit CounterIncreased(count, msg.sender);
    }

    function decrement() public {
        require(count > 0, "Counter cannot be negative");
        count--;
        emit CounterIncreased(count, msg.sender);
    }

    function getCount() public view returns (uint256) {
        return count;
    }

    function resetCounter() public {
        require(msg.sender == owner, "Only owner can reset");
        count = 0;
    }
}