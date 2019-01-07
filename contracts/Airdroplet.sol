pragma solidity ^0.4.24;

interface ERC20 {

  function totalSupply() external view returns (uint256);

  function balanceOf(address who) external view returns (uint256);

  function transfer(address to, uint256 value) external returns (bool);

  function allowance(address owner, address spender) external view returns (uint256);

  function transferFrom(address from, address to, uint256 value) external returns (bool);

  function approve(address spender, uint256 value) external returns (bool);

  event Approval(address indexed owner, address indexed spender, uint256 value);

  event Transfer(address indexed from, address indexed to, uint256 value);

}

contract Airdroplet {

    ERC20 public token;

    function airdropExecute(address source, address[] recipents, uint256 amount) public {
        token = ERC20(source);
        for(uint x = 0; x < recipents.length; x++) {
            token.transferFrom(msg.sender, recipents[x], amount);
        }
    }

}
