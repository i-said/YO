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
    <div class="container">
      <div class="remote-stream">
        <div id="remote-container"></div>
        <!-- <video id="js-remote-stream"></video> -->
      </div>
      <div class="local-stream">
        <video id="js-local-stream"></video>
      </div>
    </div>

  </section>
</template>

<script>
console.log("calling")
import twiVideo from 'twilio-video'
import CallingWaitDialog from '~/components/CallingWaitDialog'
const host = "yo-socketio.herokuapp.com"
import { mapState, mapMutations } from 'vuex'

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
  computed: {
    videoToken () {
      return this.$store.state.videoToken.token;
    },
  },
  mounted() {
    console.log("mounted path: /calling");
    console.log("videoToken:" + JSON.stringify(this.videoToken, null, "\t"))
    const accessToken = this.videoToken.token;
    const room_id = this.$route.query.room_id;
    const isOwner = this.$route.query.isOwner;
    this.isOwner = isOwner;

    const self = this;
    const localVideo = self.localVideo = document.getElementById('js-local-stream');
    const remoteVideoContainer = self.remoteVideo = document.getElementById('remote-container');
    const closeTrigger = document.getElementById('js-close-trigger');
    let videoRoom = null;

    if (!room_id) window.location.href = "/";

    const gotoThankYouPage = ()=> {
      console.log("gotoThankYouPage")
      window.location.href = "/hangup"
      return
    }

    function participantConnected (participant) {
      console.log(`Participant ${participant.identity} connected'`);
    }


    // すでに接続している参加者に関する処理を追加    
    function participantConnected(participant) {
        console.log(`Participant ${participant.identity} connected'`);

        const videoDom = document.createElement('div');
        videoDom.id = participant.sid;
        videoDom.className = 'videoDom';
        participant.on('trackAdded', track => trackAdded(videoDom, track));
        participant.tracks.forEach(track => trackAdded(videoDom, track));
        participant.on('trackRemoved', trackRemoved);

        remoteVideoContainer.append(videoDom);

    }

    // トラックを追加します
    function trackAdded(videoDom, track) {
        videoDom.appendChild(track.attach());
    }

    // トラックを削除します
    function trackRemoved(track) {
        track.detach().forEach(element => element.remove());
    }

    function participantDisconnected (participant){
        console.log(`Participant ${participant.identity} disconnected.`);

        participant.tracks.forEach(trackRemoved);
        document.getElementById(participant.sid).remove();
        gotoThankYouPage();
    }


    console.log("room_id:"+ room_id + " isOwner:" + isOwner)

    if(accessToken === undefined) {
      gotoThankYouPage()
      return
    }

    
    let localStream = null;

    navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then(stream => {
            self.localVideo.srcObject = stream;
            localStream = stream;
            connect();
        }).catch(error => {
            console.error(`mediaDevice.getUserMedia() error: ${error}`);
            return;
        });
    

    // ルームに接続
    function connect() {
      twiVideo.connect(accessToken, {
          name: room_id,
      })
      .then(room => {
        console.log(`Connected to Room ${room.name}`);
        videoRoom = room;

        room.participants.forEach(participantConnected);

        room.on('participantConnected', participantConnected);
        room.on('participantDisconnected', participantDisconnected);
        room.once('disconnected', (error) => {
          room.participants.forEach(participantDisconnected);
          gotoThankYouPage();
        });

        closeTrigger.addEventListener('click', () => {
          console.log("click disconnect")
          videoRoom.disconnect();
        })
      }).catch(error => {
          console.error(`Twilio.Video.connect error: ${error}`);
          return;
      });
    }





    // (async function main() {
    //   const localVideo = self.localVideo = document.getElementById('js-local-stream');
    //   const remoteVideo = self.remoteVideo = document.getElementById('js-remote-stream');
    //   const closeTrigger = document.getElementById('js-close-trigger');

    //   const localStream = await navigator.mediaDevices
    //     .getUserMedia({
    //       audio: true,
    //       video: false,
    //     })
    //     .catch(console.error);

    //   // Render local stream
    //   localVideo.muted = true;
    //   localVideo.srcObject = localStream;
    //   localVideo.playsInline = true;
    //   localVideo.visible = false;
    //   localVideo.controls = false;
    //   await localVideo.play().catch(console.error);

    //   const peer = window.peer

    //   // Register caller handler
    //   const callTrigger = (remoteId) => {
    //     // Note that you need to ensure the peer has connected to signaling server
    //     // before using methods of peer instance.
    //     if (!peer.open) {
    //       gotoThankYouPage()
    //       return;
    //     }
    //     const mediaConnection = peer.call(remoteId, localStream);

    //     mediaConnection.on('stream', async stream => {
    //       // Render remote stream for caller
    //       remoteVideo.srcObject = stream;
    //       remoteVideo.playsInline = true;
    //       remoteVideo.volume = 1.0;
    //       remoteVideo.controls = false;
    //       await remoteVideo.play().catch(console.error);
    //     });

    //     mediaConnection.once('close', () => {
    //       console.log("[callTrigger]mediaConnection.close")
    //       remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    //       remoteVideo.srcObject = null;
    //       gotoThankYouPage()
    //     });

    //     closeTrigger.addEventListener('click', () => {
    //       console.log("[callTrigger]closeTrigger.click")
    //       mediaConnection.close(true)
    //     });
    //   };

    //   peer.on('call', mediaConnection => {
    //     // searching modal fade
    //     self.isStartTalking = true;
    //     mediaConnection.answer(localStream);
    //     mediaConnection.on('stream', async stream => {
    //       // Render remote stream for callee
    //       remoteVideo.srcObject = stream;
    //       remoteVideo.playsInline = true;
    //       remoteVideo.volume = 1.0;
    //       remoteVideo.controls = false;
    //       await remoteVideo.play().catch(console.error);
    //     });

    //     mediaConnection.once('close', () => {
    //       console.log("[peer.call]mediaConnection.close")
    //       remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    //       remoteVideo.srcObject = null;
    //       gotoThankYouPage()
    //     });

    //     closeTrigger.addEventListener('click', () => {
    //       console.log("[peer.call]closeTrigger.click")
    //       mediaConnection.close(true)
          
    //     });
    //   });



    //   //Errorになったらもとのページに戻す？
    //   peer.on('error', console.error);

    //   //自分のIDじゃないのでCallする
    //   if(!isOwner) callTrigger(room_id)

    // })();

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