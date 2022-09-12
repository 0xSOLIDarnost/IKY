import React, { useState } from 'react'
import {Button, Input , NumberInput,  NumberInputField,  FormControl,  FormLabel } from '@chakra-ui/react'
import {ethers} from 'ethers'
import {parseEther } from 'ethers/lib/utils'
import {abi} from '../../../artifacts/contracts/TGPassport.sol/TGPassport.json'
import { Contract } from "ethers"
import { TransactionResponse,TransactionReceipt } from "@ethersproject/abstract-provider"
import {useRouter} from "next/router";

interface Props {
    addressContract: string,
    currentAccount: string | undefined
}

declare let window: any;

export default function ApplyPassportTG(props:Props){
  const addressContract = props.addressContract
  const currentAccount = props.currentAccount
  const [approved_user_id, setApprovedUserId] = useState<string>("")

  const { query } = useRouter();


  // function for bot, for approving passport. make it here for tests
  async function approvePassport(event:React.FormEvent) { 
    event.preventDefault()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const TGPassport:Contract = new ethers.Contract(addressContract, abi, signer)

    TGPassport.ApprovePassport(approved_user_id)
     .then((tr: TransactionResponse) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`)
        tr.wait().then((receipt:TransactionReceipt) => {console.log("approving receipt", receipt)})
        })
       .catch((e:Error) => console.log(e))
  }

  const handleChange = (value:string) => setApprovedUserId(value)

  return (
    <form onSubmit={approvePassport}>
    <FormControl>
      <FormLabel htmlFor='TGID'>User Telegram Id (not nickname!): </FormLabel>
      <Input id="tgid" type="text" required  onChange={(e) => setApprovedUserId(e.target.value)} value={query.user_tg_id} my={3}/>
      <Button type="submit" isDisabled={!currentAccount}>Approve Passport</Button>
    </FormControl>
    </form>
  )
}