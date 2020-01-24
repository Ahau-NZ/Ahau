<template>
  <v-card
    :to="view.id ? { name: 'whakapapaShow', params: { id: view.id } } : '/whakapapa'"
    class="d-flex"
    min-height="100px"
    color="#fff"
    :style="shadow ? '' : 'box-shadow: none;'"
  >
    <div class="d-flex flex-no-wrap justify-space-between align-stretch">
      <div class='cover-image' :style="background(view)" />

      <div>
        <v-card-title v-text="view.name" class="" />
        <v-card-subtitle v-text="view.description" />
        <v-card-text>
          <slot></slot>
        </v-card-text>
      </div>
    </div>

  </v-card>
</template>

<script>
import whakapapa from '@/assets/whakapapa.svg'

export default {
  name: 'WhakapapaViewCard',
  props: {
    view: { type: Object, required: true },
    shadow: { type: Boolean, default: true }
  },
  methods: {
    background (view) {
      if (view.image && view.image.uri) {
        return {
          backgroundImage: `url(${view.image.uri})`,
          backgroundSize: 'cover'
        }
      }

      return {
        backgroundImage: `url(${whakapapa})`,
        backgroundSize: 'contain'
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .v-card {
    color: #555 !important;

    &> .v-card__text {
      color: #555 !important;
    }
    .v-card__subtitle {
      color: #555 !important;
    }
  }

  .cover-image {
    min-width: 150px;
    width: 150px;
    background-color: #fff;
    background-position: center center;
  }
</style>
