<template>
  <section class="section hiya-top">
      <div class="columns is-mobile is-centered">
        <img src="~/assets/img/hukidasi01.png" width="300px">
      </div>
      <div class="columns is-mobile is-centered">
        <talking-button></talking-button>
      </div>
  </section>
</template>

<script>
import Peer from "skyway-js";
import TalkingButton from '~/components/TalkingButton'
import io from 'socket.io-client'
import { mapState, mapMutations, mapActions } from 'vuex'


const host = "yo-socketio.herokuapp.com";
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
        this.socket.close();
        this.$router.push({ path: '/calling', query: {'room_id': room_id , 'isOwner': false}})
    });
  }
};
</script>
