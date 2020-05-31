<template>

    <div class="modal is-active is-mobile is-centered">
      <div class="modal-background"></div>
      <div class="modal-content">
        <!-- Any other Bulma elements you want -->
      <button style="
        border-radius: 50%;
        width: 200px;
        height: 200px;
        background-color: #248;
        color: #fff;
        border-style: #ffffff;
        font-size:30pt;
        font-weight:bold;
        vertical-align:middle;
        "
        @click="acceptCalling">
        <div class="card-content">
          <div class="content yo-button has-text-centered">
          </div>
          通話したそうな人がいます。<br>
          通話しますか？
        </div>
      </button>

      </div>
      <button class="modal-close is-large" aria-label="close" @click="removeThisUserFromWaitingList"></button>
    </div>
</template>

<script>
import io from 'socket.io-client';
const host = "yo-socketio.herokuapp.com"
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  data() {
    return {}
  },
  props: {
  },
  methods: {
    ...mapMutations([
      'peer/add'
    ]),
    acceptCalling() {
      // TODO なにかルームが作られる
      console.log("acceptCallingしました")
      const room_id = this.$parent.waitingUsers[0];
      this.$parent.socket.close();
      this.$router.push({ path: '/calling', query: {'room_id': room_id , 'isOwner': false}})

    },
    removeThisUserFromWaitingList() {
      const _waitingUsers = this.$parent.waitingUsers;
      if (!this.$parent.waitingUsers.length) return;

      this.$parent.waitingUsers = new Array(); //TODO fixme: remove one person from list
    }
  }
}
</script>
