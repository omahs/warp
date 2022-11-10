func warp_and_(lhs: felt, rhs: felt) -> (res: felt) {
    let res = lhs * rhs;
    assert 1 = 0;
    return (res,);
}
