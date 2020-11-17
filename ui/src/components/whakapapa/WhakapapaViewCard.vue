<template>
  <v-card
    light
    :to="goWhakapapaShow()"
  >
    <v-container class="pa-0">
      <v-list-item-icon class="pt-1 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px">
        <v-list-item-subtitle class="no-flex mt-n1 mr-n3" :style="mobile ? 'font-size:0.7rem':'font-size:0.8rem'">Kaitiaki</v-list-item-subtitle>
        <AvatarGroup :profiles="view.kaitiaki" customClass="ma-0 pa-0 pt-1" style="position:relative; bottom:15px; left:10px" :size="mobile ? '25px':'30px'" spacing="pr-1"/>
      </v-list-item-icon>
      <div class="d-flex flex-no-wrap flex-start align-stretch">
        <div class="cover-image" :style="background(view)"></div>
        <div class="information">
          <v-card-title v-text="view.name" class="pt-3" style="word-break: break-word;"/>
          <v-card-subtitle v-text="description" class="pb-3"/>
          <v-card-text v-if="hasSlotContent">
            <slot></slot>
          </v-card-text>
        </div>
      </div>
    </v-container>
  </v-card>
</template>

<script>
import whakapapa from '@/assets/whakapapa.png'
import AvatarGroup from '@/components/AvatarGroup.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'WhakapapaViewCard',
  props: {
    view: { type: Object, required: true },
    shadow: { type: Boolean, default: true },
    cropDescription: { type: Boolean, default: false }
  },
  components: {
    AvatarGroup
  },
  computed: {
    ...mapGetters(['currentProfile']),
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
    goWhakapapaShow () {
      return {
        name: 'whakapapaShow',
        params: {
          // tribeId: this.$route.params.tribeId,
          // profileId: this.$route.params.profileId,
          whakapapaId: this.view.id
        }
      }
    },
    background (view) {
      if (view.image && view.image.uri) {
        return {
          backgroundImage: `url(${view.image.uri})`,
          backgroundSize: 'cover',
          borderTopLeftRadius: '4px',
          borderBottomLeftRadius: '4px'
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
