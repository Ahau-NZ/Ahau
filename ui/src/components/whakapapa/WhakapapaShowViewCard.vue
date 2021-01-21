<template>
  <v-card
    style="width: 100%;"
    light
    outlined
    :ripple="false"
    class="mt-5"
  >
    <!-- Whakapapa Image and Title -->
    <v-container fluid class="py-0">
      <v-row cols="12">
        <!-- Image part of the card -->
        <v-col cols="4" class="pa-0">
          <v-img
            :src="image"
            class="pa-0"
            contain
            height="100%"
            width="100%"
          >
          </v-img>
        </v-col>
        <!-- Rest of the card -->
        <v-col cols="8">
          <v-row>
            <!-- TITLE -->
            <v-card-title>{{ view.name || 'Untitled' }}</v-card-title>
            <!-- <v-card-subtitle>{{ view.description || 'No description' }}</v-card-subtitle> -->
            <v-card-text class="pa-0 d-flex justify-start align-center" style="width: 100%;">
              <!-- Lock icon for access -->
              <v-tooltip bottom v-if="access">
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    class="py-0 px-3"
                  >
                    <v-icon v-on="on" small color="#555">mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span v-if="access.isPersonalGroup">Only you have access to this whakapapa</span>
                <span v-else>Only {{ access.preferredName }} has access to this whakapapa</span>
              </v-tooltip>
              <!-- Pencil icon -->
              <slot name="edit"></slot>
              <!-- Dropdown icon -->
              <v-tooltip v-if="description || view.kaitiaki || view.tiaki" bottom>
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
          </v-row>
        </v-col>
      </v-row>
      <v-expand-transition v-if="show">
        <div>
          <v-divider></v-divider>
          <v-card-subtitle v-if="description" v-text="description" class="pa-3"/>
          <AvatarGroup :profiles="view.kaitiaki || view.tiaki" groupTitle="Kaitiaki" size="50px" showLabels @profile-click="openProfile($event)"/>
          <AvatarGroup v-if="access" :profiles="[access]" :isView="access.type === 'community'" groupTitle="Access" size="50px" showLabels @profile-click="openProfile($event)"/>
        </div>
      </v-expand-transition>
    </v-container>

  </v-card>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

import AvatarGroup from '@/components/AvatarGroup.vue'

import niho from '@/assets/niho.svg'
import whakapapa from '@/assets/whakapapa.svg'

export default {
  name: 'WhakapapaShowViewCard',
  props: {
    type: { type: String, default: 'view' },
    view: { type: Object, required: true },
    shadow: { type: Boolean, default: true },
    cropDescription: { type: Boolean, default: false },
    access: Object
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
    ...mapGetters(['currentAccess']),
    image () {
      // if there is an image return it
      if (this.view && this.view.image && this.view.image.uri) return this.view.image.uri

      // otherwise return a default one
      return (this.type === 'view')
        ? whakapapa
        : niho
    },
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

      if (this.type === 'view') {
        return {
          backgroundImage: `url(${whakapapa})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      }

      return niho
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
