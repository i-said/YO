<template>
    <button class="card" @click="createAloRoom">
      <div class="card-content">
        <div class="content yo-button has-text-centered">

        </div>
        <slot />
      </div>
    </button>
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
      alert("Aloしてくれるユーザーを待ちます");
      console.log("host:" + host)
      if (!this.$parent.socket) {
        this.$parent.socket = io(host);
      }

      let room_id = "SOMEHOW"; // TODO: skywayから払い出されたやーつを使う
      let peerObj = {'peer': 'peerobject'}
      this.$store.commit('peer/add', peerObj)
      this.$parent.socket.emit('waiting-talk', room_id)
      this.$router.push({ path: '/calling', query: {'room_id': room_id}})
    }
  }
}
</script>
