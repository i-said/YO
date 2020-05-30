<template>
  <section class="section">

    <div class="columns is-mobile is-centered">
      <talking-button>
      Alo!
      </talking-button>
    </div>
    <!--
    <span>Todo: waiting中のloading  {{ isLoading }}</span>
    -->
  </section>
</template>

<script>
import TalkingButton from '~/components/TalkingButton'
import io from 'socket.io-client'

const host = (process.env.HOST_SOCKETIO || "localhost") + ':3001';


export default {
  name: 'index',
  data() {
    return {
      waitingUsers: [],
      socket: '',
      isLoading: false
    }
  },

  components: {
    TalkingButton
  },
  mounted() {
    console.log("mounted path: /", this.socket)
    this.socket = io(host);

    // 通話したそうな人が来たらalertが飛ぶ
    this.socket.on('request-calling-user', room_id => {
        console.log("通話したそうな人がきたよ");
        let isReady = confirm("通話したそうな人がきたよ。通話を開始しますか？");
        if (isReady) return window.location.href = "./calling?room_id=" + room_id;
        // this.waitingUsers.push( message || {} )
      }
    )
  }

}
</script>
