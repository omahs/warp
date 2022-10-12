from starkware.cairo.common.uint256 import (
    Uint256,
    uint256_unsigned_div_rem,
    uint256_add,
    uint256_mul,
    uint256_sub,
    ALL_ONES,
)
from warplib.maths.utils import felt_to_uint256
from warplib.maths.addmod import warp_addmod
from starkware.cairo.common.uint256 import uint256_mul_div_mod

func warp_mulmod{range_check_ptr}(x: Uint256, y: Uint256, k: Uint256) -> (res: Uint256) {
    alloc_locals;
    if (k.high + k.low == 0) {
        with_attr error_message("Modulo by zero error") {
            assert 1 = 0;
        }
    }

    let (quotientLow, quotientHigh, remainder) = uint256_mul_div_mod(x, y, k);

    return (remainder,);
}
