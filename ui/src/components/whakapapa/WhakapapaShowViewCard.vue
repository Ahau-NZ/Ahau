<template>
  <v-card
    light
    outlined
    :ripple="false"
    class="mt-5"
  >
    <!-- Whakapapa Image and Title -->
    <v-container fluid class="py-0">
      <v-row cols="12" align="center" >
        <!-- Image part of the card -->
        <v-col cols="4" class="pa-0" >
          <v-img
            :src="image"
            class="pa-0"
            cover
            height="100px"
          >
          </v-img>
        </v-col>
        <!-- Rest of the card -->
        <v-col cols="8" class="py-0">
          <v-row>
            <!-- TITLE -->
            <v-card-title class="py-0">{{ view.name || 'Untitled' }}</v-card-title>
            <!-- <v-card-subtitle>{{ view.description || 'No description' }}</v-card-subtitle> -->
            <v-card-text class="pa-0 d-flex justify-start align-center" style="width: 100%;">
              <!-- Lock icon for access -->
              <v-tooltip bottom v-if="profile">
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    class="py-0 px-3"
                  >
                    <v-icon v-on="on" small color="#555">mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span>{{ accessText }}</span>
              </v-tooltip>
              <!-- Pencil icon -->
              <slot name="edit"></slot>
              <!-- Dropdown icon -->
              <v-tooltip v-if="description || view.tiaki" bottom>
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
                <span>{{ t('showDetails')}}</span>
              </v-tooltip>
            </v-card-text>
          </v-row>
        </v-col>
      </v-row>
      <v-expand-transition v-if="show">
        <div>
          <v-divider></v-divider>
          <v-card-subtitle v-if="description" v-text="description" class="pa-3"/>
          <v-row class="pl-4">
            <AvatarGroup :profiles="view.tiaki" groupTitle="Kaitiaki" size="50px" showLabels @profile-click="openProfile($event)"/>
            <AvatarGroup v-if="currentAccess" :profiles="[profile]" isView groupTitle="Access" size="50px" showLabels @profile-click="openProfile($event)"/>
          </v-row>
        </div>
      </v-expand-transition>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters, mapActions, createNamespacedHelpers } from 'vuex'
import mapProfileMixins from '@/mixins/profile-mixins.js'

import AvatarGroup from '@/components/AvatarGroup.vue'

import niho from '@/assets/niho.svg'
import whakapapa from '@/assets/whakapapa.svg'

const { mapActions: mapPersonActions } = createNamespacedHelpers('person')

const ACCESS_PERSONAL = 'personal'

export default {
  name: 'WhakapapaShowViewCard',
  props: {
    type: { type: String, default: 'view' },
    view: { type: Object, required: true },
    shadow: { type: Boolean, default: true },
    cropDescription: { type: Boolean, default: false }
  },
  components: {
    AvatarGroup
  },
  data () {
    return {
      show: false,
      profile: {}
    }
  },
  mixins: [
    mapProfileMixins({
      mapMethods: ['getProfile']
    })
  ],
  watch: {
    'currentAccess.profileId': {
      immediate: true,
      async handler (profileId) {
        if (!profileId) return
        this.profile = await this.getProfile(profileId)
      }
    }
  },
  computed: {
    ...mapGetters(['currentAccess']),
    accessText () {
      if (this.currentAccess.type === ACCESS_PERSONAL) return this.t('onlyYouHaveAccess')
      else return `Only ${this.profile.preferredName} has access to this whakapapa` // TODO: translate
    },
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
    ...mapActions(['setDialog']),
    ...mapPersonActions(['setProfileById']),
    openProfile (profile) {
      this.setProfileById({ id: profile.id, type: 'preview' })
      this.setDialog({ active: 'view-edit-node', type: 'preview' })
    },
    t (key, vars) {
      return this.$t('whakapapaIndex.' + key, vars)
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

</style>
