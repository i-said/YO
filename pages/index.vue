<template>
  <section class="section">
    <div class="columns is-mobile">
      <card
        title="YO!"
        icon="alert-decagram"
      >
      Say, YO!
      </card>
    </div>
  </section>
</template>

<script>
import Card from '~/components/Card'

export default {
  name: 'HomePage',

  components: {
    Card
  }
}
</script>
