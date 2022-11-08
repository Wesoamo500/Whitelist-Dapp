import Head from 'next/head'
import Web3Modal from 'web3modal'
import {Contract, providers} from 'ethers'

import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import { abi, WHITELIST_CONTRACT_ADDRESS } from '../constants'

export default function Home() {
  const [walletConnected,setWalletConnected] = useState(false)
  const [numberOfWhitelisted,setNumberOfWhitelisted] = useState(0)
  const web3ModalRef = useRef()
  const [loading,setLoading] = useState(false)
  const [joinedWhitelist, setJoinedWhitelist] = useState(false)

  const getProviderOrSigner = async(needSigner=false) =>{
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork()

      if(chainId !== 5){
        window.alert("Change the network to Goerli");
        throw new Error("Change the network to Goerli")
      };
      if(needSigner){
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (error) {
      console.log(error)
    }
  }

  const addAddressToWhitelist = async() =>{
    try {
      const signer = await getProviderOrSigner(true);
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whiteListContract.addAddressToWhitelist()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true)
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfAddressIsWhitelisted = async() =>{
    try {
      const signer = getProviderOrSigner(true)
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whiteListContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist)
    } catch (error) {
      console.log(error)
    }
  }

  const getNumberOfWhitelisted = async() =>{
    try {
      const provider = await getProviderOrSigner()
      const whiteListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numOfWhitelisted = await whiteListContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numOfWhitelisted)
    } catch (error) {
      console.log(error)
    }
  }

  const renderButton = () =>{
    if(walletConnected){
      if(joinedWhitelist){
        return(
          <div className={styles.description}>
            Thanks for joining the whitelist
          </div>
        )
      }else if(loading){
        return <button className={styles.button}>
          Loading....
        </button>
      }else{
        return(
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        )
      }
    }else{
      return(
        <button className={styles.button} onClick={connectWallet}>
          Connect your wallet
        </button>
      )
    }
  }

  const connectWallet = async() =>{
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted();
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disabledInjectedProvider:false,
      });
      connectWallet();
    }
  },[walletConnected])
  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}
