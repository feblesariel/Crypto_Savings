// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract CryptoSavings {

    mapping(address => uint256) private balance;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        balance[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balance[msg.sender] >= amount, "No dispone de ese monto.");
        balance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance() public view returns (uint256) {
        return balance[msg.sender];
    }

    function getBalanceContract() public view returns (uint256) {
        return address(this).balance;
    }
}