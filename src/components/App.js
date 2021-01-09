import React, { Component } from 'react';
import Decenttubegram from '../abis/Decenttubegram.json'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    
    //Load accounts

    const accounts = await web3.eth.getAccounts()
    console.log(accounts)

    //Add first account the the state

    this.setState({account: accounts[0]})

    //Get network ID
    const networkId = await web3.eth.net.getId()

    //Get network data
    const networkData = Decenttubegram.networks[networkId]

    //Check if net data exists, then
    if (networkData) {
      const decenttubegram = web3.eth.Contract(Decenttubegram.abi, networkData.address)
      this.setState({decenttubegram})

      const mediaCount = await decenttubegram.methods.mediaCount().call()
      this.setState({mediaCount})
      
      for (var i = mediaCount; i >= 1; i--) {
        const media = await decenttubegram.methods.medias(i).call()
        this.setState({
          medias: [...this.state.medias, media]
        })
      }

      const latest = await decenttubegram.methods.medias(mediaCount).call()
      this.setState({
        currentHash: latest.hash,
        currentTitle: latest.title,
      })
      this.setState({loading: false})

    } else {
      window.alert('Decentragram contract not deployed to detected network.')
    }
  }

  //Get Media
  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  //Upload Media
  uploadMedia = title => {
    console.log("Submitting file to IPFS...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.decenttubegram.methods.uploadMedia(result[0].hash, title, 1).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  //Change Media
  changeMedia = (hash, title) => {
    this.setState({'currentHash': hash});
    this.setState({'currentTitle': title});
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      account: '',
      decenttubegram: null,
      medias: [],
      loading: true,
      currentHash: null,
      currentTitle: null
    }

    //Bind functions
  }

  render() {
    return (
      <div>
        <Navbar 
          account={this.state.account}
        />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              medias={this.state.medias}
              uploadMedia={this.uploadMedia}
              captureFile={this.captureFile}
              changeMedia={this.changeMedia}
              currentHash={this.state.currentHash}
              currentTitle={this.state.currentTitle}
            />
        }
      </div>
    );
  }
}

export default App;