pragma solidity >=0.8.6;
// SPDX-License-Identifier: MIT

contract WARP {
    
  function f() external pure returns (uint) {
    uint a = g();
    return a;
  }

  function g() private pure returns (uint) {
    return 1;
  }
}