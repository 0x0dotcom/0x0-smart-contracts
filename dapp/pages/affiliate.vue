<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6>
      <v-card dark color="grey darken-3" class="metamask-info-template__card">
        <v-card-title class="title primary--text quick-font-fix-for-mobile"
          >How The Affiliate System Works</v-card-title
        >
        <v-card-text>
          In order to participate in the affiliate system you need to own an NFT
          <br />
          The NFT ID must pe put as a query parameter in your affiliate link eg:
          <br /><br />
          <span style="font-weight: bold"
            >https://mint.company.com?affiliateID=2</span
          ><br /><br />where 2 is the token ID that you own. It is recommended
          that you use metamask desktop for this
        </v-card-text>

        <v-card-text>
          To check how much you made call the function payments (20) from the
          contract explorer.
          <br />
          If you want to withdraw your payments call withdrawPayments from the
          write section of the contract with your wallet address
          <br />
        </v-card-text>

        <v-card-text>
          <br />For more information please contact us
        </v-card-text>
      </v-card>

      <v-card color="grey darken-3" class="mt-5">
        <v-card-title class="headline white--text quick-font-fix-for-mobile"
          >Check How Much You Gained</v-card-title
        >
        <v-card-text>
          <form>
            <v-text-field
              dark
              outlined
              style="max-width: 440px"
              v-model="checkAffiliateWallet"
              label="Your Affiliate Wallet Address"
            ></v-text-field>
            <v-btn
              class="primary black--text"
              style="min-width: 150px"
              text
              large
              @click="checkGains()"
            >
              <span style="font-weight: bold">CHECK</span>
            </v-btn>

            <p v-if="amountGained !== null" class="mt-3 title primary--text">
              Current Balance: {{ amountGained / 1000000000000000000 }} ETH
            </p>
          </form>
        </v-card-text>
      </v-card>

      <v-card color="grey darken-3" class="mt-5">
        <v-card-title class="headline white--text quick-font-fix-for-mobile"
          >Withdraw Affiliate Gains</v-card-title
        >
        <v-card-text class="white--text">
          <form>
            <v-text-field
              dark
              outlined
              style="max-width: 440px"
              v-model="withdrawAffiliateWallet"
              label="Your Affiliate Wallet Address"
            ></v-text-field>
            <v-btn
              class="primary black--text"
              style="min-width: 150px"
              text
              large
              @click="withdrawGains()"
            >
              <span style="font-weight: bold">WITHDRAW</span>
            </v-btn>
          </form>
        </v-card-text>

        <v-card-text class="white--text" v-if="txHash">
          View Transaction on
          <a target="_blank" :href="`${explorerURI}/tx/${txHash}`">etherscan</a>
        </v-card-text>
      </v-card>

      <v-card
        style="text-align: center"
        class="pa-5 ma-5 text-xs-center justify-center"
        v-if="isLoading"
        elevation="0"
      >
        <v-progress-circular indeterminate color="orange"></v-progress-circular>
        <p class="ma-3 grey--text">{{ loadingText }}</p>
      </v-card>

      <v-card
        style="text-align: center"
        class="red mt-5 text-xs-center justify-center"
        v-if="boxError"
        elevation="0"
      >
        <v-card-text class="white--text">{{ errorText }}</v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { ethers } from 'ethers'
import {
  CONTRACT_ADDR,
  RPC_PROVIDER,
  NETWORK_ID,
  EXPLORER_URI,
  OPENSEA_LINK,
} from '../constants'
import { ERC721_ABI } from '../erc721_abi'
const EthersUtils = require('ethers').utils
import { mapState } from 'vuex'

export default {
  auth: false,
  computed: mapState(['chainID', 'selectedAddress']),
  data() {
    return {
      totalMinted: 0,
      checkAffiliateWallet: null,
      withdrawAffiliateWallet: null,
      affiliateID: null,
      amount: 1,
      isLoading: false,
      balanceOf: null,
      dialogConfirmation: false,
      tokenID: null,
      contract: null,
      loadingText: 'loading...',
      account: null,
      contractAddress: null,
      txHash: null,
      ethers: null,
      signer: null,
      provider: null,
      errorText: '',
      boxError: false,
      dialogAdoptMany: false,
      dialogError: false,
      walletAddress: null,
      amountGained: null,
      walletAddress: null,
      pricePerNFTWei: 10000000000000000,
      affiliateBonus: 5000000000000000,
      affiliatePrice: 15000000000000000,
      maxSupply: 1000,
      maxFlashSale: null,
      explorerURI: EXPLORER_URI,
      openseaLink: OPENSEA_LINK,
      isAffiliatePurchase: false,
      ownedNFTs: [],
    }
  },
  async mounted() {
    this.contractAddress = CONTRACT_ADDR
    this.initialize()

    this.checkAffiliateWallet = this.selectedAddress
  },
  methods: {
    initialize() {
      this.provider = 'not_web3'
      this.ethers = new ethers.providers.JsonRpcProvider(
        RPC_PROVIDER,
        NETWORK_ID
      )
      this.contract = new ethers.Contract(
        CONTRACT_ADDR,
        ERC721_ABI,
        this.ethers
      )
    },
    async checkGains() {
      this.txHash = null
      this.boxError = false
      this.errorText = null

      if (this.checkAffiliateWallet == null) {
        this.errorText = 'Please enter the affiliate wallet address'
        this.boxError = true
        return
      }

      this.ethers = new ethers.providers.Web3Provider(window.ethereum, 'any')
      await this.ethers.send('eth_requestAccounts', [])

      this.signer = this.ethers.getSigner()
      this.contract = new ethers.Contract(
        CONTRACT_ADDR,
        ERC721_ABI,
        this.signer
      )

      this.isLoading = true
      this.loadingText = 'loading...'

      try {
        this.amountGained = Number(
          await this.contract.payments(this.checkAffiliateWallet)
        )
        if (this.amountGained === 0) {
          console.log('0')
        }
        this.isLoading = false
      } catch (err) {
        console.log(err)
        this.isLoading = false
        this.errorText = err.message
        this.boxError = true
      }
    },

    async withdrawGains() {
      this.txHash = null
      this.boxError = false
      this.errorText = null

      if (this.withdrawAffiliateWallet == null) {
        this.errorText = 'Please enter the affiliate wallet address'
        this.boxError = true
        return
      }

      this.ethers = new ethers.providers.Web3Provider(window.ethereum, 'any')
      await this.ethers.send('eth_requestAccounts', [])

      this.signer = this.ethers.getSigner()
      this.contract = new ethers.Contract(
        CONTRACT_ADDR,
        ERC721_ABI,
        this.signer
      )

      this.isLoading = true
      this.loadingText =
        'sending transaction to the blockchain. please check your wallet for confirmation'

      try {
        const tx = await this.contract.withdrawPayments(
          this.withdrawAffiliateWallet
        )
        if (tx.hash) {
          await this.onTxHashLogic(tx.hash)
        }
      } catch (err) {
        this.isLoading = false
        if (err.message.includes('denied')) {
          this.$toast.info('transaction canceled')
          this.boxError = false
          this.errorText = null
          return
        } else if (err.message.includes('insufficient funds')) {
          this.errorText = 'you do not have enough ETH for this transaction'
        } else {
          this.errorText = err.message
        }
        this.boxError = true
      }
    },

    async onTxHashLogic(txHash) {
      this.loadingText =
        'transaction submitted successfully. waiting to be mined...'
      this.isLoading = true

      const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds))
      }
      await sleep(3000)

      await this.ethers.waitForTransaction(txHash)

      try {
        let receipt = await this.ethers.getTransactionReceipt(txHash)
        if (receipt === null) {
          console.log(`Failed to get tx receipt....`)
          await sleep(3000)
        }
        this.txHash = txHash
        this.isLoading = false
      } catch (er) {
        this.isLoading = false
        console.log(`Receipt error:`, er)
      }
    },
    isInt(value) {
      return (
        !isNaN(value) &&
        parseInt(Number(value)) < 10000 &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10))
      )
    },
  },
  watch: {
    chainID: function (newValue, oldValue) {
      console.log('chainID changed to :>> ', newValue)
    },
    selectedAddress: function (newValue, oldValue) {
      console.log('address set to ', newValue)
      this.checkAffiliateWallet = newValue
      this.withdrawAffiliateWallet = newValue
    },
  },
}
</script>

<style>
.v-card__title.quick-font-fix-for-mobile {
  font-size: 13px;
}
.v-input__slot .v-label {
  color: white !important;
}
</style>
