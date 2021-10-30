// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract Fundraiser {
  string public name;
  string public url;
  string public imageURL;
  string public description;

  constructor(
    string memory _name,
    string memory _url,
    string memory _imageURL,
    string memory _description
  ) public {
    name = _name;
    url = _url;
    imageURL = _imageURL;
    description = _description;
  }
}
