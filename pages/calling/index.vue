<template>
  <section class="section">
    <div class="columns is-mobile is-centered">
      <div class="container">
        <div class="remote-stream">
          <video id="js-remote-stream" controls></video>
        </div>
        <div class="local-stream">
          <video id="js-local-stream" controls></video>
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
  methods: {
    gotoThankYouPage: ()=> {
      this.$router.push({ path: '/hungup' })
    },
  },
  mounted() {
    console.log("mounted path: /calling");
    const room_id = this.$route.query.room_id;
    const isOwner = this.$route.query.isOwner;
    if (!room_id) window.location.href = "/";

    console.log("room_id:"+ room_id + " isOwner:" + isOwner)

    const localVideo = document.getElementById("js-local-stream");
    const closeTrigger = document.getElementById("js-close-trigger");
    const remoteVideo = document.getElementById("js-remote-stream");
    const sdkSrc = document.querySelector("script[src*=skyway]");

    (async () => {
      const peer = window.peer;
      const localStream = await navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true
        })
        .catch(console.error);

      // Render local stream
      localVideo.muted = true;
      localVideo.srcObject = localStream;
      localVideo.playsInline = true;
      await localVideo.play().catch(console.error);

      peer.on("call", mediaConnection => {
      mediaConnection.answer(localStream);

      mediaConnection.on("stream", async stream => {
        // Render remote stream for callee
        remoteVideo.srcObject = stream;
        remoteVideo.playsInline = true;
        await remoteVideo.play().catch(console.error);
      });

      mediaConnection.once("close", () => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
      });

      closeTrigger.addEventListener("click", () =>
        mediaConnection.close(true)
        );
      });

      const callTrigger = (remoteId) => {
        if (!peer.open) {
          return;
        }
        const mediaConnection = peer.call(remoteId, localStream);

        mediaConnection.on("stream", async stream => {
          // Render remote stream for caller
          remoteVideo.srcObject = stream;
          remoteVideo.playsInline = true;
          await remoteVideo.play().catch(console.error);
        });

        //接続が切られた場合
        mediaConnection.once("close", () => {
          remoteVideo.srcObject.getTracks().forEach(track => track.stop());
          remoteVideo.srcObject = null;
          //TODO: 接続が切られたが切られた場合
          // gotoThankYouPage()
        });

        //接続を切る場合
        closeTrigger.addEventListener("click", () =>
          mediaConnection.close(true)
          //TODO: 接続が切られたが切られた場合
          // gotoThankYouPage()
        );
      }


      //Errorになったらもとのページに戻す？
      peer.on("error", console.error);

      if(!isOwner) {
        callTrigger(room_id)
      }
    })();

  }
};
</script>
