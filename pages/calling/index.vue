<template>
  <section class="section">
    <template v-if="10 === 100" >
      <calling-wait-dialog />
    </template>
    <div class="columns is-mobile is-centered">
      <div class="container">
        <div class="remote-stream">
          <video id="js-remote-stream"></video>
        </div>
        <div class="local-stream">
          <video id="js-local-stream"></video>
        </div>
        <div>
          <button id="js-close-trigger">Close</button>
        </div>
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
      waitingUsers: [],
      socket: "",
      isLoading: false
    };
  },
  components:{
    CallingWaitDialog
  },
  mounted() {
    console.log("mounted path: /calling");
    const room_id = this.$route.query.room_id;
    const isOwner = this.$route.query.isOwner;
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


    (async function main() {
      const localVideo = document.getElementById('js-local-stream');
      const remoteVideo = document.getElementById('js-remote-stream');
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
          remoteVideo.volume = 0.75;
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
        mediaConnection.answer(localStream);

        mediaConnection.on('stream', async stream => {
          // Render remote stream for callee
          remoteVideo.srcObject = stream;
          remoteVideo.playsInline = true;
          remoteVideo.volume = 0.75;
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

  }
};
</script>
