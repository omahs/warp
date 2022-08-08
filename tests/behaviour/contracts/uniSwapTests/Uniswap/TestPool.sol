pragma solidity ^0.8.0;

import './interfaces/pool/IUniswapV3PoolActions.sol';

contract UniPoolTest {

    function initialize_(address addr, uint160 sqrtPrice) external {
        IUniswapV3PoolActions(addr).initialize(sqrtPrice);
    }

    function mint_(
    address addr,
    address recipient,
    int24 tickLower,
    int24 tickUpper,
    uint128 amount
  ) external returns (uint256 amount0, uint256 amount1) {
        bytes memory data = 'Test';
        return IUniswapV3PoolActions(addr).mint(recipient, tickLower, tickUpper, amount, data);
        
  }
}