export const state = () => ({
    userInfo: null
  })
  
export const mutations = {
    add(state, info) {
        console.log("userInfo mutations add", JSON.stringify(info, null, '\t'))
        state.userInfo = info
    }
}
  