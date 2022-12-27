pragma solidity >=0.8.6;
// SPDX-License-Identifier: MIT

contract WARP {
  uint a = 10;

  function f() public returns (uint) {
    a += 1;
    return a;
  }
}