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
        <p>
          <img id="js-close-trigger" src="~/assets/img/btn_hangup.png" width="300px">
        </p>
        <div class="controls">
          <b-switch v-model="mute" @input="toggleMute">mute</b-switch>
          <b-switch v-model="mute" @input="toggleMute">mute</b-switch>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="remote-stream">
        <div id="remote-container"></div>
      </div>
      <div class="local-stream">
          <div id="local-container"></div>
        <!-- <video id="js-local-stream"></video> -->
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
      isOwner: false,
      videoToken: "",
      twilioVideo: "",
      videoRoom: "",
    };
  },
  methods: {
    toggleMute:function() {
      console.log("mute:" + this.mute)
      // this.localVideo.srcObject.getAudioTracks()[0].enabled = !this.mute
      this.videoRoom.localParticipant.audioTracks.forEach(publication => {
        (this.mute) ? publication.track.disable() : publication.track.enable()
      });
    },
    leave: function() {
      console.log("leave")
    },
    getVideoToken: async function(store, query, $axios) {
      console.log("asyncData")

      const room = store.state.userInfo.userInfo.room;
      const room_id = query.room_id;
      const identity = store.state.userInfo.userInfo.identity;
      console.log(`room:${room},room_id:${room_id}, identity:${identity}`)

      const twilioTokenUrl = "http://localhost:3000/video-token";
      const videoToken = await $axios.$get(twilioTokenUrl,{
          params: {
          room: room_id,
          identity: identity,
        }
      });
      console.log("asyncData:videoToken:" + videoToken)
      return videoToken;
    }
  },
  components:{
    CallingWaitDialog
  },
  computed: {
    userInfo () {
      return this.$store.state.userInfo.userInfo;
    },
  },
  mounted() {
    console.log("mounted path: /calling");
    const self = this;
    const room_id = this.$route.query.room_id;
    const isOwner = this.$route.query.isOwner;
    (async ()=> { 
      self.videoToken = await self.getVideoToken(self.$store , self.$route.query , self.$axios);

      console.log("mounted:videoToken:" + JSON.stringify(self.videoToken, null, "\t"));
      console.log("mounted:userInfo:" + JSON.stringify(self.userInfo, null, "\t"));

      if(!self.videoToken) gotoThankYouPage();
      
      const accessToken = self.videoToken.token;
      console.log("accessToken:"+accessToken)

      self.isOwner = isOwner;

      self.twilioVideo = twiVideo;
      // const localVideo = self.localVideo = document.getElementById('js-local-stream');
      const localVideo = self.localVideo = document.getElementById('local-container');
      const remoteVideoContainer = self.remoteVideo = document.getElementById('remote-container');
      const closeTrigger = document.getElementById('js-close-trigger');
      

      if (!room_id) gotoThankYouPage();

      const gotoThankYouPage = () => {
        location.href = "/hangup"
        // $router.push("/hangup")
      }

      const participantConnected = (participant) => {
          console.log(`Participant ${participant.identity} connected'`);
          self.isStartTalking = true;

          const div = document.createElement('div');
          div.id = participant.sid;
          // div.innerText = participant.identity;

          participant.on('trackSubscribed', track => trackSubscribed(div, track));
          participant.on('trackUnsubscribed', trackUnsubscribed);
        
          participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
              trackSubscribed(div, publication.track);
            }
          });
        
          remoteVideoContainer.appendChild(div);
      }

      const participantDisconnected = (participant) => {
          console.log(`Participant ${participant.identity} disconnected.`);
          document.getElementById(participant.sid).remove();
          gotoThankYouPage();
      }

      const trackSubscribed = (div, track) => {
          div.appendChild(track.attach());
      }

      const trackUnsubscribed = (track) => {
          track.detach().forEach(element => element.remove());
      }


      console.log("room_id:"+ room_id + " isOwner:" + isOwner)
      
      let localStream = null;

      navigator.mediaDevices.getUserMedia({video: true, audio: true})
          .then(stream => {
            
            // self.localVideo.muted = true;
            // self.localVideo.control = true;
            // self.localVideo.srcObject = stream;
            localStream = stream;
            connect();
          }).catch(error => {
              console.error(`mediaDevice.getUserMedia() error: ${error}`);
              return;
          });
      

      // ルームに接続
      const connect = () => {
        twiVideo.connect(accessToken, {
            name: room_id,
        })
        .then(room => {
          console.log(`Connected to Room ${room.name}`);
          self.videoRoom = room;


          room.Loca

          room.participants.forEach(participantConnected);

          room.on('participantConnected', participantConnected);
          room.on('participantDisconnected', participantDisconnected);
          room.once('disconnected', (error) => {
            room.participants.forEach(participantDisconnected);
            console.log(error);
            gotoThankYouPage();
          });


        }).catch(error => {
            console.error(`Twilio.Video.connect error: ${error}`);
            return;
        });
      }

      closeTrigger.addEventListener('click', () => {
        console.log("click disconnect")
        self.videoRoom.disconnect();
        self.videoRoom = null;
      })
    })();




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
    if(this.videoRoom !== null) {
      this.videoRoom.disconnect();
    }
    if(this.localVideo.srcObject !== null) {
      this.localVideo.srcObject.getTracks().forEach(track => track.stop());
      // this.localVideo.pause();
      this.localVideo.srcObject = null;
      
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