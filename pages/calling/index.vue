<template>
  <section class="section">

    <div class="columns is-mobile is-centered">
      きっとこのへんでskywayされるはず
    </div>
  </section>
</template>

<script>
import TalkingButton from '~/components/TalkingButton'
import io from 'socket.io-client'
const host = 'localhost:3001';


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
    console.log("mounted path: /calling");
      let room_id = this.$route.query.room_id;
      if (!room_id) window.location.href = "/";
  }

}
</script>
