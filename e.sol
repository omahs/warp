pragma solidity ^0.8.0;

contract e {

 function f() external view  {
    this;
 }

 function g() external view {
    this.f();
 }
}