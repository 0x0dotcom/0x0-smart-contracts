export const state = () => ({
  selectedAddress: null,
  chainID: 0,
})

export const getters = {
  getChainID(state) {
    return state.chainID
  },
  getSelectedAddress(state) {
    return state.selectedAddress
  },
}

export const actions = {
  setChainID({ commit }, data) {
    commit('SET_CHAIN_ID', data)
  },
  setSelectedAddress({ commit }, data) {
    commit('SET_SELECTED_ADDRESS', data)
  },
}

export const mutations = {
  SET_SELECTED_ADDRESS(state, payload) {
    state.selectedAddress = payload
  },
  SET_CHAIN_ID(state, payload) {
    state.chainID = payload
  },
}
