import type { NextPage } from 'next'
import Head from 'next/head'
//import NextLink from "next/link"
import { VStack, Heading, Box, LinkOverlay, LinkBox} from "@chakra-ui/layout"
import { Text, Button } from '@chakra-ui/react'
import { useState, useEffect} from 'react'
import {ethers} from "ethers"
import ApplyPassportTG from 'components/applyPassport'


declare let window:any

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()

  useEffect(() => {
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return
    //client side code
    if(!window.ethereum) return
    const provider = new ethers.providers.Web3Provider(window.ethereum,"any");
    provider.on("network", (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
          window.location.reload();
      }
    });

    provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
    })

    provider.getNetwork().then((result)=>{
      if (result.chainId != 137) {
        addPolygonNetwork()
      } else {
        setChainId(result.chainId)
        setChainName(result.name)
      }
    })

  },[currentAccount])

  const onClickConnect = () => {
    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    /*
    //change from window.ethereum.enable() which is deprecated
    //see docs: https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts:any)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch('error',console.error)
    */

    //we can do it using ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch((e)=>console.log(e))
  }

  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
  }

  const addPolygonNetwork = () => {
    window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
          chainId: "0x89",
          rpcUrls: ["https://polygon-rpc.com/"],
          chainName: "Matic Mainnet",
          nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18
          },
          blockExplorerUrls: ["https://explorer.matic.network"]
      }]
  });
  }

  const switchToPolygon = () => {
    window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{
          chainId: "0x89"
      }]
  });
  }

  return (
    <>
      <Head>
        <title>My Telegram Passport</title>
      </Head>

      <Heading as="h3"  my={4}>Attach your wallet to tgid</Heading>          
      <VStack>
        <Box w='100%' my={4}>
        {currentAccount  
          ? <Button type="button" w='100%' onClick={onClickDisconnect}>
                Account:{currentAccount}
            </Button>
          : <Button type="button" w='100%' onClick={onClickConnect}>
                  Connect MetaMask
              </Button>
        }
        </Box>
        {currentAccount  
          ?<Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Account info</Heading>
          <Text>ETH Balance of current account: {balance}</Text>
          <Text>Chain Info: ChainId {chainId} name {chainname}</Text>
          <Text>Chain must be matic!</Text>
        </Box>
        :<></>
        }
        <Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Attach telegram id and username to your wallet</Heading>
          <ApplyPassportTG 
            addressContract='0x34BCAC93be263c8c1a56f651a8bE7FEEb69A56BA'
            currentAccount={currentAccount}
          />
        </Box>
     

...
      </VStack>
    </>
  )
}

export default Home