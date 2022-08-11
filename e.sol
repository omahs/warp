pragma solidity ^0.8.0;


contract e {

    function mul_normal(uint x, uint y) external pure returns (uint, uint) {
        uint x0;
        unchecked {
            x0 = x * y;
        }
        uint x1 = mulmod(x, y, 2**256-1);
        uint r0 = x0;
        
        uint r1 = x1;
        if (x1 < x0) 
            r1 = r1 - 1;
        
        // uint r1 = x1 - x0 - (x1 < x0 ? 1 : 0);
        return (r0, r1);    
    }

}