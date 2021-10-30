// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract Fundraiser {
  string public name;

  constructor(string memory _name) public {
    name = _name;
  }
}
