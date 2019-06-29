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
      this.setState({ account: accounts[0],
        networkId, dAppInstance, web3 })
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
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
    const tokenInterface = JSONImport.networks[this.state.networkId];
    const tokenInstance = new this.state.web3.eth.Contract(ERC20.abi, tokenInterface
      && this.state.web3.utils.toChecksumAddress(_event.target.value)
    );
    var tokenName = await tokenInstance.methods.name().call()
    var tokenSymbol  = await tokenInstance.methods.symbol().call()
    var rawBalance = await tokenInstance.methods.balanceOf(this.state.account).call()
    var parsedValue = this.state.web3.utils.toBN(rawBalance).div(this.state.web3.utils.toBN(1e18))
    var displayValue = this.state.web3.utils.hexToNumberString(parsedValue);
    this.setState({
      balance: displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      symbol: tokenSymbol,
      name: tokenName
    });
  }

  parseFile = (_event) => {
    var targetFile = _event.target.files[0];
    this.state.fileReader.readAsText(targetFile)
    this.state.fileReader.onloadend = this.readFile
  }

  readFile = (e) => {
    var fileContent = this.state.fileReader.result
    this.setState({ fileData:
      fileContent.replace(/\r?\n|\r/g, ' ').split(",")
    });
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
          <Button className="transactionButton">{this.state.buttonText}</Button>
          <span className="tokenBalance">
           Balance: <span style={{ color: 'black'}}> {this.state.balance} {this.state.symbol}</span>
          </span>
        </Modal>
        <PendingModal className="pendingModal">
        <span className="addressCount">
        0/{this.state.fileData.length}
        </span>
        </PendingModal>
        <ConfirmationModal className="confirmationModal"/>
      </div>
    );
  }
}

export default Airdroplet;
