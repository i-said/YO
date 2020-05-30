<template>
    <button class="card" @click="createAloRoom">
      <div class="card-content">
        <div class="content yo-button has-text-centered">

        </div>
        <slot />
      </div>
    </button>
</template>

<script>
import io from 'socket.io-client';
const host = 'localhost:3001';

export default {
  data() {
    return {
    }
  },
  props: {
  },
  methods: {
    createAloRoom() {
      // TODO なにかルームが作られる
      alert("Aloしてくれるユーザーを待ちます");
      if (!this.$parent.socket) {
        this.$parent.socket = io(host);
      }

      let room_id = "SOMEHOW"; // TODO: skywayから払い出されたやーつを使う
      this.$parent.socket.emit('waiting-talk', room_id)
      window.location.href = "./calling?room_id=" + room_id;
    }

  }
}
</script>
