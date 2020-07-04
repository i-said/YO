<template>
    <div class="modal is-active">
      <div class="modal-background bg_image_hiyaing"></div>
      <div class="modal-content">
        <div class="contents">
          <p class="hukidasi02">
            <img src="~/assets/img/hukidasi02.png" width="300px">
          </p>
          <p class="hito02">
            <img src="~/assets/img/hito02.png" width="300px">
          </p>
        </div>
      </div>
      <b-button type="is-primary" onclick="location.href='/hangup'">Cancel</b-button>
    </div>
</template>

<script>
export default {}
</script>

<style>
.contents {
  height: auto;
}
.modal-background {
  background-color: #FFA0C9;
  background-size: cover;
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  transform: translateZ(0);
}
</style>