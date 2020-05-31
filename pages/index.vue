<template>
  <section class="section">
    <div class="columns is-mobile is-centered">
      <talking-button>moshi!<br>moshi!</talking-button>
    </div>
    <!--
    <span>Todo: waiting中のloading  {{ isLoading }}</span>
    -->
  </section>
</template>

<script>
import Peer from "skyway-js";
import TalkingButton from '~/components/TalkingButton'
import io from 'socket.io-client'
import { mapState, mapMutations, mapActions } from 'vuex'

const host = process.env.HOST_SOCKET_IO; //.env.local
// const host = "yo-socketio.herokuapp.com";
// const host = "localhost:3001"; //.env.local

export default {
  name: "index",
  data() {
    return {
      waitingUsers: [],
      socket: "",
      isLoading: false,
      myUserID: "",
      peer: ""
    };
  },

  components: {
    TalkingButton
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
      let isReady = confirm("通話したそうな人がきたよ。通話を開始しますか？");
      if (isReady)
        return (window.location.href = "./calling?room_id=" + room_id);
      // this.waitingUsers.push( message || {} )
    });
  }
};
</script>
