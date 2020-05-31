export const state = () => ({
  skywayPeer: null
})

export const mutations = {
  add(state, peer) {
    console.log("this mutations add", peer)
    state.skywayPeer = peer
  }
}
