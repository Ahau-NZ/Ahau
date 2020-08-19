<template>
  <v-card
    style="width: 100%"
    light
    outlined
    :ripple="false"
  >
    <!-- Whakapapa Image and Title -->
    <div class="d-flex pa-3" style="width: 100%;">

      <!-- Whakapapa Image -->
      <div :style="background(view)" style="width: 20%;"/>

      <div class="information d-flex flex-column justify-center align-center"  style="width: 80%;">
        <!-- Whakapapa Title -->
        <v-card-title v-text="view.name" class="py-0 pl-3 justify-start" style="width: 100%;"/>

        <!-- Whakapapa Title Icons -->
        <v-card-text class="pa-0 d-flex justify-start align-center" style="width: 100%;">
          <!-- Lock icon -->
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                class="py-0 px-3"
              >
                <v-icon v-on="on" small color="#555">mdi-lock</v-icon>
              </v-btn>
            </template>
            <span>Private record - Only visible by you</span>
          </v-tooltip>
          <!-- Pencil icon -->
          <slot name="edit"></slot>
          <!-- Dropdown icon -->
          <v-tooltip v-if="description || view.kaitiaki" bottom>
            <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              @click.stop="show = !show"
              icon
              class="pa-0 px-3"
            >
              <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
            </template>
            <span>Show Whakapapa details</span>
          </v-tooltip>
        </v-card-text>
      </div>
    </div>
    <v-expand-transition>
      <div v-show="show">
        <v-divider></v-divider>
        <v-card-subtitle v-if="description" v-text="description" class="pa-3"/>
        <AvatarGroup :profiles="view.kaitiaki" groupTitle="Kaitiaki" size="50px" showLabels @profile-click="openProfile($event)"/>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import whakapapa from '@/assets/whakapapa.svg'
import { mapGetters, mapActions } from 'vuex'

import AvatarGroup from '@/components/AvatarGroup.vue'

export default {
  name: 'WhakapapaShowViewCard',
  props: {
    view: { type: Object, required: true },
    shadow: { type: Boolean, default: true },
    cropDescription: { type: Boolean, default: false }
  },
  components: {
    AvatarGroup
  },
  data () {
    return {
      show: false
    }
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
    ...mapActions(['setDialog', 'setProfileById']),
    goProfile (component) {
      this.$router.push({ name: 'profileShow', params: { id: this.currentProfile.id } }).catch(() => {})
    },
    openProfile (profile) {
      this.setProfileById({ id: profile.id, type: 'preview' })
      this.setDialog({ active: 'view-edit-node', type: 'preview' })
    },
    background (view) {
      if (view.image && view.image.uri) {
        return {
          backgroundImage: `url(${view.image.uri})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }
      }
      return {
        backgroundImage: `url(${whakapapa})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
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
  min-width: 20%;
  background-color: #fff;
  background-position: center center;
  @media screen and (min-width: 420px) {
    width: 150px;
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