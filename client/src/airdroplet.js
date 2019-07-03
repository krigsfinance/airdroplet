import React, { Component } from "react";

import JSONImport from "./contracts/Airdroplet.json"
import ERC20 from "./contracts/IERC20.json"
import getWeb3 from "./utils/getWeb3"

// Components

import ConfirmationModal from "./components/confirmationModal"
import PendingModal from "./components/pendingModal"
import TextInput from "./components/textInput"
import Button from "./components/button"
import Modal from "./components/modal"

import "./assets/css/apple-sf.css"
import "./assets/css/airdroplet.css"

class Airdroplet extends Component {
  state = {
    fileReader: new FileReader,
    buttonText: "Approve",
    currentIndex: 0,
    fileData: []
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const networkId = await web3.eth.net.getId()
      const dApp = JSONImport.networks[networkId];
      const dAppInstance = new web3.eth.Contract(JSONImport.abi,
             dApp && dApp.address,
      );
      dAppInstance.options.address = "0x9c60ba70d19684d8b4b5c267baedee2b52d9d129";
      this.setState({ account: accounts[0],
        networkId, dAppInstance, web3 })
    } catch (error) {
      alert(
        `Please install Metamask! `,
      );
      console.error(error);
    }
  };

  embedState = (_event) => {
    this.setState({
      [_event.target.name]: _event.target.value
    });
  }

  tokenMetadata = async(_event) => {
    console.log(this.state.networkId);
    const tokenInterface = ERC20.networks[this.state.networkId];
    const tokenInstance = new this.state.web3.eth.Contract(ERC20.abi, tokenInterface
      && this.state.web3.utils.toChecksumAddress(_event.target.value)
    );
    tokenInstance.options.address = this.state.web3.utils.toChecksumAddress(_event.target.value);
    var tokenName = await tokenInstance.methods.name().call()
    var tokenSymbol  = await tokenInstance.methods.symbol().call();
    var tokenDecimals  = await tokenInstance.methods.decimals().call()
    tokenDecimals = this.stringNumber(tokenDecimals);
    var rawBalance = await tokenInstance.methods.balanceOf(this.state.account).call()
    var displayValue = this.displayNumber(this.parseNumber(rawBalance, tokenDecimals));
    this.setState({
      balance: displayValue,
      decimals: tokenDecimals,
      symbol: tokenSymbol,
      name: tokenName,
      tokenInstance,
    });
  }

  airdropTokens = async() => {
    var tokenAddress = this.state.tokenInstance.address
    var addressArray = this.state.fileData;
    var inputArray = addressArray.slice(0,100);
    var airdropAmount = this.stringNumber(this.convertNumber(this.state.amount, parseInt(this.state.decimals)))
    var nextIndex = 100;

    for(var _index = 0; _index < addressArray.length; _index += 100){
      if(_index+100 > addressArray.length) nextIndex = addressArray.length;
      else nextIndex = _index+100;

      const properNonce = await this.state.web3.eth.getTransactionCount(this.state.account);
      const gasHeight = 62500000000;
      const gasLimit = 8000000;

      this.setState({ currentIndex: _index });
      inputArray = addressArray.slice(_index, nextIndex);
      await new Promise((resolve, reject) => {
       this.state.dAppInstance.methods.airdropTokens(tokenAddress, inputArray, airdropAmount).send({
         gasLimit: this.state.web3.utils.toHex(gasLimit),
         gasPrice: this.state.web3.utils.toHex(gasHeight),
         nonce: this.state.web3.utils.toHex(properNonce),
        from: this.state.account
      }).on('confirmation',
        (confirmationNumber, receipt) => {
          if(confirmationNumber < 5) {
            console.log(confirmationNumber);
            resolve(receipt)
          }
       })
    })
   }
  }

  approveTokens = async() => {
    var airdropletAddress = this.state.dAppInstance.address;
    var approvalTotal  = this.state.amount * (this.state.fileData.length + 1)
    var approvalAmount = this.stringNumber(this.convertNumber(approvalTotal, this.state.decimals))
    await this.state.tokenInstance.methods.approve(airdropletAddress, approvalAmount).send({
      from: this.state.account
    }, (error, transactionHash) => {
      if(transactionHash) this.setState({
        approvedTokens: approvalAmount,
        buttonAction: this.airdropTokens,
        buttonText: "Airdrop!"
     })
   })
  }

  buttonMechanisim = async() => {
    if(this.state.buttonText === "Approve"){
      await this.approveTokens()
    } else {
      await this.airdropTokens()
    }
  }

  parseNumber = (_hexNumber, _decimals) => {
    return this.stringNumber(this.state.web3.utils.toBN(_hexNumber).div(this.state.web3.utils.toBN(Math.pow(10,parseInt(_decimals)))))
  }

  convertNumber = (_decimalNumber, _decimals) => {
    return this.state.web3.utils.toBN(_decimalNumber).mul(this.state.web3.utils.toBN(Math.pow(10,parseInt(_decimals))))
  }

  displayNumber = (_decimalString) => {
    return _decimalString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  stringNumber = (_hexNumber) => {
    return this.state.web3.utils.hexToNumberString(_hexNumber)
  }

  parseFile = (_event) => {
    var targetFile = _event.target.files[0];
    this.state.fileReader.readAsText(targetFile)
    this.state.fileReader.onloadend = this.readFile
  }

  readFile = (e) => {
    var fileContent = this.state.fileReader.result.replace(/\r?\n|\r/g, ' ');
    fileContent = fileContent.replace(/\s+/g, '').split(",")
    fileContent.map((_arrayCell, _cellIndex) => {
      if(!this.state.web3.utils.isAddress(_arrayCell)){
          fileContent[_cellIndex] = fileContent[_arrayCell.length-1]
          fileContent.length--;
      }
    }); this.setState({ fileData:
      fileContent
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="dApp">
        <Modal className="transactionModal">
          <TextInput onMouseOut={this.tokenMetadata} name="address" className="addressInput"/>
          <TextInput accept=".csv" type="file" onChange={this.parseFile} className="fileInput"/>
          <TextInput type="number" onChange={this.embedState} name="amount" className="amountInput"/>
          <Button onClick={this.buttonMechanisim} className="transactionButton">{this.state.buttonText}</Button>
          <span className="tokenBalance">
           Balance: <span style={{ color: 'black'}}> {this.state.balance} {this.state.symbol}</span>
          </span>
        </Modal>
        <PendingModal className="pendingModal">
        <span className="addressCount">
          {this.state.currentIndex}/{this.state.fileData.length}
        </span>
        <span className="addressIndex">
        Address
        </span>
        </PendingModal>
        <ConfirmationModal className="confirmationModal"/>
      </div>
    );
  }
}

export default Airdroplet;
