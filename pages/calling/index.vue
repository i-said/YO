<template>
  <section>
    <template v-if="isOwner && !isStartTalking" >
      <calling-wait-dialog />
    </template>
    <div class="columns is-mobile is-centered">
      <div class="box hangup-box is-centered has-text-centered">
        <p class="hito02">
          <img src="~/assets/img/txt_talking.png" width="300px">
        </p>
        <p class="hito03">
          <img src="~/assets/img/hito03.png" width="300px">
        </p>
        <a href="" id="js-close-trigger">
          <img src="~/assets/img/btn_hangup.png" width="300px">
        </a>
        <div class="controls">
          <b-switch v-model="mute" @input="toggleMute">mute</b-switch>
        </div>
      </div>
    </div>
    <div class="container is-hidden">
      <div class="remote-stream">
        <video id="js-remote-stream"></video>
      </div>
      <div class="local-stream">
        <video id="js-local-stream"></video>
      </div>
    </div>

  </section>
</template>

<script>
import Peer from "skyway-js";
import CallingWaitDialog from '~/components/CallingWaitDialog'

const host = "yo-socketio.herokuapp.com"
import { mapState, mapMutations } from 'vuex'

// const host = "localhost:3001"; //.env.local

export default {
  layout: 'calling',
  name: "index",
  data() {
    return {
      localVideo: null,
      remoteVideo: null,
      mute: false,
      waitingUsers: [],
      socket: "",
      isLoading: false,
      isStartTalking: false,
      isOwner: false
    };
  },
  methods: {
    toggleMute:function() {
      console.log("mute:" + this.mute)
      this.localVideo.srcObject.getAudioTracks()[0].enabled = !this.mute
    },
    leave: function() {
      console.log("leave")
    }
  },
  components:{
    CallingWaitDialog
  },
  mounted() {
    console.log("mounted path: /calling");
    const room_id = this.$route.query.room_id;
    const isOwner = this.$route.query.isOwner;
    this.isOwner = isOwner;
    if (!room_id) window.location.href = "/";

    const gotoThankYouPage = ()=> {
      console.log("gotoThankYouPage")
      window.location.href = "/hangup"
      return
    }

    console.log("room_id:"+ room_id + " isOwner:" + isOwner)

    if(window.peer === undefined) {
      gotoThankYouPage()
      return
    }

    const self = this;
    (async function main() {
      const localVideo = self.localVideo = document.getElementById('js-local-stream');
      const remoteVideo = self.remoteVideo = document.getElementById('js-remote-stream');
      const closeTrigger = document.getElementById('js-close-trigger');

      const localStream = await navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
        })
        .catch(console.error);

      // Render local stream
      localVideo.muted = true;
      localVideo.srcObject = localStream;
      localVideo.playsInline = true;
      localVideo.visible = false;
      localVideo.controls = false;
      await localVideo.play().catch(console.error);

      const peer = window.peer

      // Register caller handler
      const callTrigger = (remoteId) => {
        // Note that you need to ensure the peer has connected to signaling server
        // before using methods of peer instance.
        if (!peer.open) {
          gotoThankYouPage()
          return;
        }
        const mediaConnection = peer.call(remoteId, localStream);

        mediaConnection.on('stream', async stream => {
          // Render remote stream for caller
          remoteVideo.srcObject = stream;
          remoteVideo.playsInline = true;
          remoteVideo.volume = 1.0;
          remoteVideo.controls = false;
          await remoteVideo.play().catch(console.error);
        });

        mediaConnection.once('close', () => {
          console.log("[callTrigger]mediaConnection.close")
          remoteVideo.srcObject.getTracks().forEach(track => track.stop());
          remoteVideo.srcObject = null;
          gotoThankYouPage()
        });

        closeTrigger.addEventListener('click', () => {
          console.log("[callTrigger]closeTrigger.click")
          mediaConnection.close(true)
        });
      };

      peer.on('call', mediaConnection => {
        // searching modal fade
        self.isStartTalking = true;
        mediaConnection.answer(localStream);
        mediaConnection.on('stream', async stream => {
          // Render remote stream for callee
          remoteVideo.srcObject = stream;
          remoteVideo.playsInline = true;
          remoteVideo.volume = 1.0;
          remoteVideo.controls = false;
          await remoteVideo.play().catch(console.error);
        });

        mediaConnection.once('close', () => {
          console.log("[peer.call]mediaConnection.close")
          remoteVideo.srcObject.getTracks().forEach(track => track.stop());
          remoteVideo.srcObject = null;
          gotoThankYouPage()
        });

        closeTrigger.addEventListener('click', () => {
          console.log("[peer.call]closeTrigger.click")
          mediaConnection.close(true)
          
        });
      });



      //Errorになったらもとのページに戻す？
      peer.on('error', console.error);

      //自分のIDじゃないのでCallする
      if(!isOwner) callTrigger(room_id)

    })();

  },
  beforeDestroy() {
    console.log("beforeDestroy")
    if(this.localVideo.srcObject !== null) {
      this.localVideo.srcObject.getTracks().forEach(track => track.stop());
    }
  }
};
</script>


<style scoped>
  .hangup-box {
    width: 80%;
    min-height: 60%;
    margin-top: 100px;
    padding: 30px;
  }
  .hangup-button {
    background-color: #FFA0C9;
    color: #ffffff;
    font-size: 24px !important;
  }
</style>