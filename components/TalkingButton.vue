<template>
      <img src="~/assets/img/btn_hiya.png" width="300px" @click="createAloRoom">
</template>

<script>
import io from 'socket.io-client';
const host = "yo-socketio.herokuapp.com"
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  data() {
    return {}
  },
  props: {},
  methods: {
    ...mapMutations([
      'peer/add'
    ]),
    createAloRoom() {
      // TODO なにかルームが作られる
      alert("Looking for someone to talk to...");
      console.log("host:" + host)
      if (!this.$parent.socket) {
        this.$parent.socket = io(host);
      }
      console.log("room:" + this.$parent.userInfo.room)

      // this.$store.commit('peer/add', this.$parent.peer)
      this.$parent.socket.emit('waiting-talk', this.$parent.userInfo.room)
      // close main socket
      this.$parent.socket.close();
      console.log("this.$router.push")
      this.$router.push({ path: '/calling', query: {'room_id': this.$parent.userInfo.room , 'isOwner': true}})
    }
  }
}
</script>
