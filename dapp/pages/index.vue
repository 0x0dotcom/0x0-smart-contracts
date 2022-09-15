<template>
  <v-container>
    <div class="main-block">
      <v-card style="text-align: center" class="pt-5 mt-5">
        <span class="display-3 ma-5 white--text">0x0</span>
        <br />
        <span class="title ma-5 white--text">nft minting dapp</span>
      </v-card>

      <div
        v-if="totalMinted && totalMinted >= maxSupply"
        class="display-1 ma-5 subtitle"
        style="text-align: center; font-weight: bold"
      >
        <br />
        <span class="display-3 glow" style="font-weight: bold">SOLD OUT!</span>
        <br />
        Thank you for participating!<br />
      </div>

      <v-card
        class="pa-5 ma-5"
        v-if="totalMinted < maxSupply - 20 && !isLoading"
        elevation="0"
      >
        <div style="margin-top: 30px" class="search-form__row">
          <v-form lazy-validation>
            <div>
              <div class="sel-btn">
                <p style="color: #fff !important">Quantity</p>
                <v-select
                  :items="Array.from({ length: 3 }, (_, i) => i + 1)"
                  class="quantity-input text-center"
                  label="Qty"
                  v-model="amount"
                  solo
                  required
                >
                  <template slot="selection" slot-scope="{ item }">
                    <span class="mx-auto qty-amount">
                      {{ item }}
                    </span>
                  </template>
                </v-select>
              </div>

              <v-btn
                x-large
                block
                class="mt-5 primary black--text"
                @click="
                  errorText = ''
                  mintBtnPressed()
                "
              >
                <strong>MINT</strong>
              </v-btn>
            </div>
          </v-form>
        </div>

        <p class="body-1 ma-5 white--text">
          {{ pricePerNFTWei / 1000000000000000000 }} ETH / nft
        </p>
      </v-card>

      <div
        v-if="txHash"
        style="
          max-width: 700px;
          margin: 0 auto;
          color: white;
          border: 1px dashed grey;
        "
      >
        <p style="text-align: center" class="title ma-5">
          View Transaction on
          <span style="font-weight: bold"
            ><a target="_blank" :href="`${explorerURI}/tx/${txHash}`"
              >etherscan</a
            ></span
          >
          <br />
          Your NFT will show up in
          <a target="_blank" :href="`${openseaLink}`">opensea</a> shortly
        </p>
      </div>

      <v-card
        style="text-align: center"
        class="red pa-1 ma-3 text-xs-center justify-center"
        v-if="boxError"
        elevation="0"
      >
        <v-card-text class="white--text">{{ errorText }}</v-card-text>
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
    </div>

    <v-card
      style="text-align: center"
      class="pa-5 ma-5 text-xs-center justify-center"
      color="#333"
    >
      <p class="ma-5">
        <span style="color: grey !important"></span>
        <a target="_blank" :href="`${openseaLink}`">opensea</a>
        <span style="color: grey !important"> | </span>

        <a href="/other/disclaimer">disclaimer</a>
        <span style="color: grey !important"> | </span>

        <a href="/affiliate">affiliate</a>
      </p>

      <p class="ma-5 grey--text">
        please use

        <a href="https://metamask.io/download.html" target="_blank">
          metamask</a
        >
        desktop when minting
      </p>
    </v-card>
  </v-container>
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
import whitelistData from '../whitelist.json'

export default {
  auth: false,
  computed: mapState(['chainID', 'selectedAddress']),
  data() {
    return {
      whitelist: whitelistData,
      totalMinted: 0,
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
    this.affiliateID = this.$route.query.affiliateID

    this.contractAddress = CONTRACT_ADDR

    this.initialize()

    if (this.affiliateID) {
      //check validity of the affiliate ID
      await this.checkAffiliateID()
    }

    this.timerOperations()
    const timer = setInterval(() => {
      this.timerOperations()
    }, 30000)

    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer)
    })

    this.isLoading = true
    this.loadingText = 'retrieving smart contract state'
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
    async timerOperations() {
      this.totalMinted = Number(await this.contract.totalSupply())
      console.log('minted = ', this.totalMinted, ' / ', this.maxSupply)
      this.isLoading = false
    },
    async checkAffiliateID() {
      if (!this.isInt(this.affiliateID)) {
        this.errorText = 'Invalid Affiliate ID'
        this.boxError = true
        return
      }
      this.pricePerNFTWei = this.affiliateBonus + this.affiliatePrice
      this.isAffiliatePurchase = true
    },

    async mintBtnPressed() {
      //TODO: modify me in timer opperations
      //await this.preSaleBuy(this.amount)
      //manual activation of next phase

      if (this.isAffiliatePurchase) {
        await this.affiliateSale(this.amount)
      } else {
        await this.publicSale(this.amount)
      }
    },

    async preSaleBuy(quantity) {
      this.txHash = null
      this.boxError = false
      this.errorText = null
      this.ethers = new ethers.providers.Web3Provider(window.ethereum, 'any')
      await this.ethers.send('eth_requestAccounts', [])
      this.signer = this.ethers.getSigner()
      this.contract = new ethers.Contract(
        CONTRACT_ADDR,
        ERC721_ABI,
        this.signer
      )
      this.account = await this.signer.getAddress()

      //WHITELIST
      let whitelistInfo = null
      for (let i = 0; i < this.whitelist.length; i++) {
        if (
          String(this.whitelist[i]['Address']).toLowerCase() ==
          String(this.account).toLowerCase()
        ) {
          whitelistInfo = this.whitelist[i]
        }
      }
      if (!whitelistInfo) {
        this.errorText =
          'Your address ' +
          this.account +
          ' is not whitelisted. Please connect with the correct wallet'
        this.boxError = true
        this.isLoading = false
        return
      }

      this.isLoading = true
      this.loadingText = 'sending transaction to the blockchain...'

      try {
        //const gasLimit = quantity * 200000
        this.itemPriceWei = Number(this.pricePerNFTWei)
        const overrides = {
          value: String(Number(quantity) * Number(this.itemPriceWei)),
          //gasLimit: gasLimit,
        }
        const tx = await this.contract.presaleBuy(
          quantity,
          whitelistInfo['TokenID'],
          whitelistInfo['Proof'],
          overrides
        )
        if (tx.hash) {
          await this.onTxHashLogic(tx.hash)
        }
      } catch (err) {
        this.isLoading = false
        if (err.message.includes('denied')) {
          this.$toast.info('you canceled the transaction')
          this.boxError = false
          this.errorText = null
          return
        } else {
          if (err.message.includes('wallet limit')) {
            this.errorText =
              'over max allowed! your wallet limit has been reached'
          } else if (err.message.includes('insufficient funds')) {
            this.errorText = 'you do not have enough ETH for this transaction'
          } else {
            this.errorText = err.message
          }
          this.boxError = true
        }
      }
    },

    async affiliateSale(quantity) {
      this.txHash = null
      this.boxError = false
      this.errorText = null

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
        // const gasLimit = quantity * 100000
        this.itemPriceWei = Number(this.pricePerNFTWei)
        const overrides = {
          value: String(Number(quantity) * Number(this.itemPriceWei)),
          // gasLimit: gasLimit,
        }
        const tx = await this.contract.affiliateBuy(
          quantity,
          this.affiliateID,
          overrides
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

    async publicSale(quantity) {
      this.txHash = null
      this.boxError = false
      this.errorText = null

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
        // const gasLimit = quantity * 100000
        this.itemPriceWei = Number(this.pricePerNFTWei)
        const overrides = {
          value: String(Number(quantity) * Number(this.itemPriceWei)),
          // gasLimit: gasLimit,
        }
        const tx = await this.contract.publicBuy(quantity, overrides)
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
    },
  },
}
</script>

<style lang="scss" scoped>
.main-block {
  max-width: 960px;
  margin: auto;
  position: relative;
}
.main-block .m-right {
  position: absolute;
  top: 180px;
  right: -220px;
}
.main-block p {
  line-height: 1.6;
  text-align: center;
  font-size: 20px;
  margin: auto;
}
.main-block img {
  margin: 20px auto;
  max-width: 520px;
}

.container {
  max-width: 1500px;
}
.black-text {
  color: black i !important;
}

.theme--dark.v-input input,
.theme--dark.v-input textarea {
  color: #ea700c;
}

.glow {
  -webkit-text-stroke: 1px #c30f16;
  text-shadow: 0 0 15px rgb(137 246 143 / 77%), 0 0 10px transparent;
  -webkit-text-fill-color: transparent;
}
.centered-input input {
  text-align: center;
}

.container div {
  z-index: 1;
}

.banner {
  display: flex;
}

.banner h2 {
  font-size: 48px;
  padding: 18px 45px;
  background: #c30f16;
  color: #000000;
  text-align: center;
  margin-left: auto;
  width: 100%;
}

.timer {
  display: flex;
  padding: 35px 45px;
  margin-left: 37%;
  line-height: 1.15;
}

.timer div {
  font-size: 50px !important;
  text-align: right;
}

.timer span {
  font-size: 51px !important;
  color: #346dac !important;
  padding: 0 6px;
  line-height: 1;
}

.timer p {
  font-size: 10px !important;
  text-align: center;
  margin: auto;
}

.main-right-block {
  padding-left: 30px;
}

.main-right-block > div {
  display: flex;
  margin-bottom: 40px;
  line-height: 1.2;
}

.main-right-block h3 {
  font-size: 34px;
  width: 185px;
  min-width: 185px;
  text-align: right;
  word-break: break-word;
}

.main-right-block ul {
  margin-left: 25px;
  padding-left: 25px;
  border-left: 4px solid #346dac;
}

.main-right-block ul li {
  margin-bottom: 25px;
}

.main-right-block form {
  margin-left: 25px;
  width: 100%;
}

.sel-btn {
  display: flex;
  justify-content: space-between;
  border: 4px dotted #50d6f5;
  padding: 10px 16px;
  align-items: center;
  max-width: 242px;
  width: 100%;
  margin-right: 20px;
}

.sel-btn p {
  font-size: 17px;
  margin-bottom: 0;
}

::v-deep .v-icon {
  color: #50d6f5 !important;
}

::v-deep .quantity-input {
  max-width: 64px;
  border-left: 1px solid;
  border-radius: 0;
}

::v-deep .v-input__control {
  min-height: 24px !important;
  height: 24px;
}

::v-deep .quantity-input .v-input__slot {
  padding-right: 0px !important;
  margin: auto;
  background: transparent !important;
  box-shadow: none !important;
}

::v-deep .quantity-input .v-select__slot .v-select__selection,
::v-deep .quantity-input .qty-amount,
::v-deep .quantity-input select {
  color: #fff !important;
  text-align: center;
  font-size: 30px !important;
  right: 0 !important;
}

::v-deep .quantity-input .v-text-field__details {
  display: none !important;
}

::v-deep .quantity-input .v-select__slot input {
  display: none;
}

::v-deep .mint-btn {
  font-size: 20px;
  font-weight: bold;
  height: 64px !important;
  background: transparent !important;
  border: 6px solid #50d6f5;
  text-transform: capitalize !important;
  border-radius: 0 !important;
  max-width: 342px;
  width: 100%;
  margin-top: 30px;
}

::v-deep .mint-btn .v-btn__content {
  color: #fff !important;
}

::v-deep .mint-btn {
  will-change: transform;
  transition: transform 250ms;
}

::v-deep .mint-btn:hover {
  transform: translateY(-3px);
}

::v-deep .mint-btn:active {
  transform: translateY(0px);
}

@media (max-width: 1200px) {
  .timer {
    margin-left: 15%;
  }
}

@media (max-width: 767px) {
  .banner h2 {
    font-size: 35px;
    margin: auto;
  }

  .timer {
    text-align: center;
    margin-left: 10%;
  }

  .col {
    padding: 0 !important;
  }

  .main-right-block {
    display: flex;
    flex-direction: column-reverse;
  }

  .main-right-block > div {
    flex-direction: column;
    padding-left: 40px;
    padding-right: 40px;
  }

  .main-right-block h3 {
    width: 100%;
    text-align: left;
  }

  .main-right-block ul {
    margin-left: 0;
    padding-left: 0px;
    padding-top: 25px;
    margin-top: 25px;
    border-left: none;
    border-top: 4px solid #50d6f5;
  }

  .main-right-block form {
    margin-left: 0;
  }

  .presale-minting {
    margin-bottom: 300px !important;
  }
}

.container {
  max-width: 1500px;
}
.black-text {
  color: black i !important;
}
.theme--dark.v-input input,
.theme--dark.v-input textarea {
  color: #50d6f5;
}
.glow {
  -webkit-text-stroke: 1px #50d6f5;
  text-shadow: 0 0 15px rgb(137 246 143 / 77%), 0 0 10px transparent;
  -webkit-text-fill-color: transparent;
}
.centered-input input {
  text-align: center;
}
.main-block {
  max-width: 560px;
  margin: auto;
  position: relative;
}
.main-block .m-right {
  position: absolute;
  top: 180px;
  right: -220px;
}
.main-block p {
  line-height: 1.6;
  text-align: center;
  font-size: 20px;
  margin: auto;
}
.main-block img {
  margin: 20px auto;
  max-width: 520px;
}
::v-deep .quantity-input {
  width: 180px;
}
::v-deep .quantity-input .v-input__slot {
  height: 48px;
  margin: auto;
}
::v-deep .quantity-input .v-select__slot .v-select__selection,
::v-deep .quantity-input .qty-amount,
::v-deep .quantity-input select {
  color: #fff !important;
  text-align: center;
  font-size: 16px !important;
  right: 0 !important;
}
::v-deep .quantity-input .v-text-field__details {
  display: none !important;
}
::v-deep .quantity-input .v-select__slot input {
  display: none;
}
::v-deep .mint-btn {
  height: 48px !important;
}
::v-deep .mint-btn .v-btn__content {
  color: #fff !important;
}
::v-deep .mint-btn {
  will-change: transform;
  transition: transform 250ms;
}
::v-deep .mint-btn:hover {
  transform: translateY(-3px);
}
::v-deep .mint-btn:active {
  transform: translateY(0px);
}
.search-form__row p {
  line-height: 2;
  text-align: center;
  font-size: 20px;
  margin: auto;
}
@media (max-width: 767px) {
  .main-block img {
    width: 100%;
  }
  ::v-deep .quantity-input {
    width: 100%;
  }
  .main-block .m-right {
    position: relative !important;
    margin-top: 20px;
    top: 0;
    right: 0;
  }
}
</style>
