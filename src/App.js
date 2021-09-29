import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import openSeaLogo from './assets/OpenSeaLogomark-Blue.svg';

import React, {useEffect, useState} from "react";
//A library that helps our frontend talk to our contract. 
import {ethers} from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const MyTWITTER_HANDLE = 'gabyBabuchi';
const MyTWITTER_LINK = `https://twitter.com/${MyTWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-scymoadodg';

const CONTRACT_ADDRESS = "0xa81aEDB47Ab82967D76e0b0869e51e99ce8b7844";

const App = () => {
  //A state variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  //A state variable to know when to display spinner
  const [isMiningNFT, setIsMiningNFT] = useState(false);

  //State variables to count number of NFTs already minted and total allowed
  const [nMintedNFTs,setNMintedNFTs] = useState(0);
  const [totalNFTs, setTotalNFTs] = useState(-1);

  // Render Methods
  const checkIfWalletIsConnected = async () => {
    // Make sure you have access to window.ethereum
    const {ethereum} = window;

    if(!ethereum) {
      console.log("Make sure you have metamask");
      return;
    }
    else{
      console.log("We have the ethereum object", ethereum);
    }

    //Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({method: 'eth_accounts'});

    //Grab the first account
    if(accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      //Setup listener when some user already has his wallet connected + authorized
      setupEventListener();
    }
    else{
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        alert("Get Metamask!");
        return;
      }

      //request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

      //setup event listener when the user enters the site an connect his wallet for the first time
      setupEventListener();
    }
    catch( error){
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //Create the connection to our contract.
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        //capture our event when the contract throws it
        connectedContract.on("NewEpicNFTMinted", async (from, tokenId)=> {
          const [mintedNfts, total] = await connectedContract.getNumberOfMintedNFTs();
          setNMintedNFTs(mintedNfts.toNumber());
          console.log(from, tokenId.toNumber())
          alert(`Hellouuuu! We've minted your NFT and set it to your wallet. Wait patiently for OpenSea and then admire that piece of art at: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log("Setup event listener");
      } 
      else{
         console.log("Ethereum object doesn't exist!")
      }
    }
    catch (error){
      console.log(error)
    }
  }

  const askContractToMintNft = async () =>{
    try {
      const {ethereum} = window;

      const currentNetwork = ethereum.networkVersion;
      console.log("Current network", currentNetwork);

      if(currentNetwork != 4){
        alert("Sorry mate, this site only works on Rinkeby! Plase change your network :)");
        return;
      }

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //Create the connection to our contract.
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gass...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        setIsMiningNFT(true);
        console.log("Mining... please wait")
        await nftTxn.wait();
        console.log(nftTxn);
        setIsMiningNFT(false);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)

      } 
      else{
         console.log("Ethereum object doesn't exist!")
      }
    }
    catch (error){
      console.log(error)
    }
  }

  //Update local state varibales referencing NFTs numbers
  const getNftsMintedSoFar = async () =>{
    const {ethereum} = window;

    if(ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      //Create the connection to our contract.
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      const [mintedNfts, total] = await connectedContract.getNumberOfMintedNFTs();

      setNMintedNFTs(mintedNfts.toNumber());
      setTotalNFTs(total.toNumber());
    }
  }

  useEffect(()=>{
    getNftsMintedSoFar();
  },[]);

  //run function checkIfWalletIsConnected when the page loads
  useEffect(()=> {
    checkIfWalletIsConnected();
  }, []);

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  //alternative button
  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      One please!
    </button>
  );

  const renderButton = () =>{
    return currentAccount === ""?  renderNotConnectedContainer():
      renderMintUI()
  }


  const renderSpinner = () =>(
    <div>
      <div className="loader">
        <i className="fa fa-cog fa-spin" />
      </div>

      <h5 className="medium-container-text">Mining</h5>
    </div>
  );

  const renderUpsText = () =>(
    <p className="sub-text-awesome gradient-text">
      Ups no more NFTs of this limited edition! Stay tuned for more!
    </p>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Super Giraffe's NFT Collection<span role="img" aria-label="unicorn">🦄</span></p>
          <p className="sub-text">
            Wanna mint your own NFT? Try one of our crazy combinations. 
          </p>
          <p className="sub-text-awesome gradient-text">
          {nMintedNFTs}/{totalNFTs} already minted!!!
          </p>
          {(nMintedNFTs === totalNFTs)?                 renderUpsText(): renderButton()
          }
        </div>

        <div>
          {isMiningNFT? renderSpinner(): null}        
        </div>
        
        <div className="footer-container">
          <img alt="OpenSea Logo" className="os-logo" src={openSeaLogo} />
          <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >{` View Collection on Open Sea!`}</a>

          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={MyTWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Built by @${MyTWITTER_HANDLE}`}</a>
        
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
