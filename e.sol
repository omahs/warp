pragma solidity ^0.8.0;


contract e {
    function test(uint8 x, uint8 y) external pure returns (uint) {
        return x+y;
    }
}

contract e_modified {
    function test_<FIRST_NAME_AS_SUFFIX>(uint8 x_<SURNAME_AS_SUFFIX>, uint8 y<SURNAME_AS_SUFFIX>) external pure returns (uint) {
        return x_<SURNAME_AS_SUFFIX>+y_<SURNAME_AS_SUFFIX>;
    }
}