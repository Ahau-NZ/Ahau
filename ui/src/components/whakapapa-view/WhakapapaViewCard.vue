<template>
  <v-card
    :to="view.id
        ? { name: 'whakapapaShow', params: { id: view.id } }
        : '/whakapapa'"
    class="d-flex pa-2"
    color="#fff"
    :style="shadow ? '' : 'box-shadow: none;'"
  >
    <div class="body-width d-flex flex-no-wrap flex-start align-stretch">
      <div class="cover-image" :style="background(view)"></div>
      <div class="information">
        <v-card-title v-text="view.name" class="pt-3"/>
        <v-card-subtitle v-text="description" class="pb-3"/>
        <v-card-text v-if="hasSlotContent">
          <slot></slot>
        </v-card-text>
      </div>
    </div>
  </v-card>
</template>

<script>
import whakapapa from '@/assets/whakapapa.png'

export default {
  name: 'WhakapapaViewCard',
  props: {
    view: { type: Object, required: true },
    shadow: { type: Boolean, default: true },
    cropDescription: { type: Boolean, default: false }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    hasSlotContent () {
      return Boolean(this.$slots.default)
    },
    description () {
      const description = this.view.description
      if (
        this.mobile &&
        this.cropDescription &&
        description &&
        description.length > 80
      ) {
        return description.substring(0, 80) + '...'
      }
      return description
    }
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
        backgroundSize: 'cover'
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.v-card {
  color: #555 !important;

  & > .v-card__text {
    color: #555 !important;
  }
  .v-card__subtitle {
    color: #555 !important;
  }
}

.cover-image {
  min-width: 15%;
  background-color: #fff;
  background-position: center center;
  @media screen and (min-width: 420px) {
    width: 84px;
  }
}

.information {
  @media screen and (max-width: 420px) {
    width: 70%;
  }
}

.body-width {
  width: 100%;
}
</style>
