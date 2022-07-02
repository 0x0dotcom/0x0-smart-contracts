<template>
  <v-app>
    <v-app-bar
      class="app-nav"
      style="background-color: #000"
      clipped-left
      app
      elevation="0"
    >
      <v-toolbar-title>
        <nuxt-link style="text-decoration: none" to="/">
          <img
            src="/images/logo_white.png"
            style="max-width: 140px"
            alt="oxo logo"
          />
        </nuxt-link>
      </v-toolbar-title>

      <div class="social-btns">
        <v-btn href="https://twitter.com/xxxxx" target="_blank" fab text>
          <v-icon color="primary">mdi-twitter</v-icon>
        </v-btn>

        <v-btn
          href="https://discord.com/invite/xxxxxx"
          target="_blank"
          fab
          text
        >
          <v-icon color="primary">mdi-discord</v-icon>
        </v-btn>

        <v-btn
          large
          class="primary ma-3 black--text"
          text
          @click="metamaskButtonClicked()"
        >
          <span style="font-weight: bold">{{ walletBtnText }}</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <nuxt />
    </v-main>

    <v-footer v-if="showNonMainnetWarning" color="red">
      <div class="flex" flat>
        <div class="text-h4 pa-5 white--text text-center">
          <strong>Warning!</strong> Not connected to the correct ethereum
          network!
        </div>
      </div>
    </v-footer>
    <v-footer
      v-else
      style="background-color: transparent; text-align: center"
      class="grey--text text-body-1 text-xs-center justify-center"
      >copyright 2022-present Ⓒ anonrobin.com
    </v-footer>
  </v-app>
</template>
<script>
import { ethers } from 'ethers'
import { RPC_PROVIDER, NETWORK_ID, CONTRACT_ADDR } from '../constants'
import { mapActions } from 'vuex'
export default {
  auth: false,
  data() {
    return {
      contractAddress: CONTRACT_ADDR,
      walletBtnText: 'CONNECT WALLET',
      ethers: null,
      provider: null,
      showNonMainnetWarning: false,
    }
  },
  mounted() {
    //this.rpcProviderInit()
  },
  methods: {
    ...mapActions({
      setChainID: 'setChainID',
      setSelectedAddress: 'setSelectedAddress',
    }),
    goToUrl(url) {
      this.$router.push(url)
    },
    goToExternalUrl(url) {
      window.open(url, '_blank')
    },
    async metamaskButtonClicked() {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
      await provider.send('eth_requestAccounts', [])
      this.signer = provider.getSigner()
      this.provider = 'web3'
      this.ethers = new ethers.providers.Web3Provider(window.ethereum, 'any')
      this.ethers.on('network', (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          this.setChainID(newNetwork.chainId)
        }
        console.log('newNetwork.chainId :>> ', newNetwork.chainId)
        if (Number(newNetwork.chainId) !== Number(NETWORK_ID)) {
          this.showNonMainnetWarning = true
        } else {
          this.showNonMainnetWarning = false
        }
      })
      this.signer = this.ethers.getSigner()
      this.account = await this.signer.getAddress()
      this.balance = await this.signer.getBalance()
      this.ethBalance = await ethers.utils.formatEther(this.balance)
      this.signer = this.ethers.getSigner()
      const addr = await this.signer.getAddress()
      this.setSelectedAddress(addr)
      this.walletBtnText =
        addr.substr(0, 8) + '...' + addr.substr(addr.length - 5, addr.length)
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length < 1) return
        this.setSelectedAddress(accounts[0])
        this.walletBtnText =
          accounts[0].substr(0, 8) +
          '...' +
          accounts[0].substr(accounts[0].length - 5, accounts[0].length)
      })
      const { chainId } = await this.ethers.getNetwork()
      this.setChainID(chainId)
      if (chainId !== NETWORK_ID) {
        this.showNonMainnetWarning = true
      }
    },
  },
}
</script>
<style scoped>
.social-btns {
  display: flex;
}

::v-deep .social-btns a {
  width: 72px;
  height: 72px;
}

::v-deep .social-btns i {
  font-size: 42px !important;
}

.logo-img {
  width: 100%;
  max-height: 820px;
  position: absolute;
  bottom: 0;
  z-index: 0;
}
</style>
