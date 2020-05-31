<template>
  <section class="section hiya-top">
    <div class="columns is-mobile is-centered">
      <img src="~/assets/img/hukidasi01.png" width="300px">
    </div>
    <div class="columns is-mobile is-centered">
      <talking-button></talking-button>
      <template v-if="waitingUsers.length">
        <calling-proposal-dialog />
      </template>

    </div>
  </section>
</template>

<script>
import Peer from "skyway-js";
import TalkingButton from '~/components/TalkingButton'
import CallingProposalDialog from '~/components/CallingProposalDialog'

import io from 'socket.io-client'
import { mapState, mapMutations, mapActions } from 'vuex'

const host = process.env.HOST_SOCKET_IO;

export default {
  name: "index",
  data() {
    return {
      waitingUsers: [],
      socket: "",
      isLoading: false,
      isCallingAccepted: false,
      myUserID: "",
      peer: ""
    };
  },

  components: {
    TalkingButton,
    CallingProposalDialog
  },
  methods: {
    ...mapActions([
      'peer/add'
    ])
  },
  mounted() {
    console.log("mounted path: /", this.socket);
    this.socket = io(host);

    this.peer = (window.peer = new Peer({
      key: "d8e43ecb-578b-414e-a161-2f00615b447e",
      debug: 3
    }));

    //Openすると、IDが払い出される。このIDで相手とのやり取りが開始される。
    this.peer.once("open", id => (this.myUserID = id));

    // 通話したそうな人が来たらalertが飛ぶ
    this.socket.on("request-calling-user", room_id => {
      console.log("通話したそうな人がきたよ");
      this.waitingUsers.push(room_id);
      console.log("通話したそうな人→", this.waitingUsers);

    });
  }
};
</script>
