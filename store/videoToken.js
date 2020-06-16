export const state = () => ({
    token: null
  })
  
export const mutations = {
    add(state, videoToken) {
        console.log("this mutations add", videoToken)
        state.token = videoToken
    }
}
  