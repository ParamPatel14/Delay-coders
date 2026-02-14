// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EcoBadge {
    mapping(address => uint256) public points;
    mapping(address => bool) public firstTxBadge;

    event PointsAwarded(address indexed user, uint256 amount);
    event FirstTransactionBadge(address indexed user);

    function awardPoints(address user, uint256 amount) external {
        require(user != address(0), "invalid user");
        points[user] += amount;
        if (!firstTxBadge[user]) {
            firstTxBadge[user] = true;
            emit FirstTransactionBadge(user);
        }
        emit PointsAwarded(user, amount);
    }
}
