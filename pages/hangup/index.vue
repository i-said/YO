<template>
  <section class="section">
    <div class="contents">
      <p class="thank">
        <img src="~/assets/img/thank.png" width="300px">
      </p>

    </div>
  </section>
</template>

<script>
import Peer from "skyway-js";
import TalkingButton from '~/components/TalkingButton'
import io from 'socket.io-client'
import { mapState, mapMutations, mapActions } from 'vuex'


const host = "yo-socketio.herokuapp.com";

export default {
  name: "hangup",
  data() {
    return {
      isLoading: false,
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
    console.log("mounted path: /hangup", this.socket);
  }
};
</script>
