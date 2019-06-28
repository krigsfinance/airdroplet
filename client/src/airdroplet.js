import React, { Component } from "react";

import JSONImport from "./contracts/Airdroplet.json"
import getWeb3 from "./utils/getWeb3"

import TextInput from "./components/textInput"
import Button from "./components/button"
import Modal from "./components/modal"
import PendingModal from "./components/pendingModal"
import ConfirmationModal from "./components/confirmationModal"

import "./assets/css/apple-sf.css"
import "./assets/css/airdroplet.css"

class Airdroplet extends Component {
  state = {};

  componentDidMount = async () => {
    try {

      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      const networkId = await web3.eth.net.getId()
      this.setState({ web3 })

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="dApp">
        <Modal className="transactionModal">
          <TextInput className="addressInput"/>
          <TextInput className="amountInput"/>

          <Button className="transactionButton">Airdrop</Button>
        </Modal>
        <PendingModal className="pendingModal"/>
        <ConfirmationModal className="confirmationModal"/>
      </div>
    );
  }
}

export default Airdroplet;
