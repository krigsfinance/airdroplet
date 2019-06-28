pragma solidity ^0.5.8;

import './IERC20.sol';

contract Airdroplet {

    IERC20 public Token;

    function airdropTokens(address _contract, address[] _participants, uint _amount) public {
      Token = ERC20Interface(_contract);
      for(uint index = 0; index < _participants.length; index++){
        Token.transferFrom(msg.sender, _participants[index], _amount);
      }
    }

}
