<template>
  <section class="section hiya-top">
    <div class="columns is-mobile is-centered">
      <div class="column column is-half">

        <div class="columns is-mobile is-centered">
          <img class="column" src="~/assets/img/hukidasi01.png" width="300px" />
        </div>

        <div class="columns is-mobile is-centered">
            <talking-button class="column"></talking-button>
        </div>

      </div>
    </div>
    <template v-if="waitingUsers.length">
      <calling-proposal-dialog />
    </template>   
  </section>
</template>

<script>
// import Peer from "skyway-js";
import twilio from 'twilio-video'

import TalkingButton from '~/components/TalkingButton'
import CallingProposalDialog from '~/components/CallingProposalDialog'

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
      isCallingAccepted: false,
      myUserID: "",
      twilio: "",
      videoToken: ""
    };
  },
  components: {
    TalkingButton,
    CallingProposalDialog
  },
  async asyncData(context) {
    const twilioTokenUrl = "http://localhost:3000/video-token";
    const videoToken = await context.app.$axios.$get(twilioTokenUrl)
    console.log("videoToken:" + videoToken)
    // context.app.$store.commit('videoToken/add', videoToken)
    return {videoToken};
  },
  methods: {
    ...mapActions([
      'videoToken/add'
    ]),
    addVideoToken(token) {
      console.log("addVideoToken:" + JSON.stringify(token, null, '\t'));
      this.$store.commit('videoToken/add', token);
    },

  },
  mounted() {
    console.log("mounted path: /", this);
    this.socket = io(host);
    this.addVideoToken(this.videoToken);


    // this.peer = (window.peer = new Peer({
    //   key: "d8e43ecb-578b-414e-a161-2f00615b447e",
    //   debug: 3
    // }));

    // //Openすると、IDが払い出される。このIDで相手とのやり取りが開始される。
    // this.peer.once("open", id => (this.myUserID = id));

    // 通話したそうな人が来たらalertが飛ぶ
    this.socket.on("request-calling-user", room_id => {
      console.log("通話したそうな人がきたよ");
      this.waitingUsers.push(room_id);
      console.log("通話したそうな人→", this.waitingUsers);
    });
  }
};
</script>
