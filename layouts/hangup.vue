<template>
  <div>
    <section class="main-content columns bg_image_hangup">
      <div class="container">
        <div class="column">
          <NavBar/>
        </div>
        <div class="container column is-10">
          <nuxt />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavBar from '~/components/NavBar.vue'
export default {
  components: {
    NavBar
  },
  data () {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Inspire',
          icon: 'lightbulb',
          to: { name: 'inspire' }
        }
      ]
    }
  }
}
</script>
