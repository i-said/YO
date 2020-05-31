<template>
  <section class="section">
    <div class="columns is-mobile is-centered">
      <div class="container">
        <h1 class="heading">P2P Media example</h1>
        <p class="note">Enter remote peer ID to call.</p>
        <div class="p2p-media">
          <div class="remote-stream">
            <video id="js-remote-stream" controls></video>
          </div>
          <div class="local-stream">
            <video id="js-local-stream" controls></video>
            <p>
              Your ID:
              <span id="js-local-id"></span>
            </p>
            <input type="text" placeholder="Remote Peer ID" id="js-remote-id" />
            <!-- 自動的に接続するならCallボタンは不要 -->
            <button id="js-call-trigger">Call</button>
            <button id="js-close-trigger">Close</button>
          </div>
        </div>
        <p class="meta" id="js-meta"></p>
      </div>
    </div>
  </section>
</template>

<script>
import Peer from "skyway-js";
import io from "socket.io-client";
const host = "yo-socketio.herokuapp.com"
import { mapState, mapMutations } from 'vuex'

// const host = "localhost:3001"; //.env.local

export default {
  name: "index",
  data() {
    return {
      waitingUsers: [],
      socket: "",
      isLoading: false
    };
  },
  mounted() {
    console.log("mounted path: /calling", this.skywayPeerOjbect);
    let room_id = this.$route.query.room_id;
    if (!room_id) window.location.href = "/";

    (async function main() {
      const localVideo = document.getElementById("js-local-stream");
      const localId = document.getElementById("js-local-id");
      localId.innerHTML = room_id;
      const callTrigger = document.getElementById("js-call-trigger");
      const closeTrigger = document.getElementById("js-close-trigger");
      const remoteVideo = document.getElementById("js-remote-stream");
      const remoteId = document.getElementById("js-remote-id");
      const meta = document.getElementById("js-meta");
      const sdkSrc = document.querySelector("script[src*=skyway]");

      const peer = window.peer;

      // meta.innerText = `
      //   UA: ${navigator.userAgent}
      //   SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
      // `.trim();

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

      // const peer = (window.peer = new Peer({
      //   key: 'd8e43ecb-578b-414e-a161-2f00615b447e',
      //   debug: 3
      // }));

      // //Openすると、IDが払い出される。このIDで相手とのやり取りが開始される。
      // peer.once("open", id => (localId.textContent = id));

      // Register caller handler
      callTrigger.addEventListener("click", () => {
        // Note that you need to ensure the peer has connected to signaling server
        // before using methods of peer instance.
        if (!peer.open) {
          return;
        }

        console.log(peer);
        const mediaConnection = peer.call(remoteId.value, localStream);

        mediaConnection.on("stream", async stream => {
          // Render remote stream for caller
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

      //Openすると、IDが払い出される。このIDで相手とのやり取りが開始される。
      peer.once("open", id => (localId.textContent = id));

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

      //Errorになったらもとのページに戻す？
      peer.on("error", console.error);
    })();
  }
};
</script>
