<template>
  <DialogContainer :title="`${view.name} Whakapapa`" :show="show" @close="close" width="720px" :goBack="close" :enableBar="false">
    <template v-slot:content>
      <Avatar
        class="big-avatar"
        size="250px"
        :image="view.image"
        :alt="view.name"
        :view="view"
        isView
        style="margin-top: 20px;"
      />
      <div v-if="view.canEdit" justify="center" align="center" class="px-4">
        <h1>{{ view.name }}</h1>
        <v-btn
          @click="$emit('edit')"
          align="right"
          color="white"
          text
          class="blue--text pt-4"
        >
          <v-icon class="blue--text" left>mdi-pencil</v-icon>Edit
        </v-btn>
      </div>
      <v-row justify="center" align="center" class="mt-5">
        <v-col>{{ view.description }}</v-col>
      </v-row>
      <v-row class="pl-4">
        <AvatarGroup :profiles="view.tiaki" groupTitle="Kaitiaki" size="50px" showLabels @profile-click="openProfile($event)"/>
        <AvatarGroup v-if="currentAccess" :profiles="[currentAccessProfile]" :isView="currentAccess.type === ACCESS_ALL_MEMBERS" groupTitle="Access" size="50px" showLabels @profile-click="openProfile($event)"/>
      </v-row>
    </template>
    <template v-slot:actions>
      <v-col :align="mobile ? 'center' : 'end'" class="py-0">
        <v-btn
          text
          @click="close"
        >
          close
        </v-btn>
      </v-col>
    </template>
  </DialogContainer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'

import { ACCESS_ALL_MEMBERS } from '@/lib/constants'

export default {
  name: 'WhakapapaViewDialog',
  components: {
    Avatar,
    AvatarGroup
  },
  props: {
    view: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Whakapapa View'
    }
  },
  data () {
    return {
      ACCESS_ALL_MEMBERS,
      currentAccessProfile: {}
    }
  },
  computed: {
    ...mapGetters(['currentAccess']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.vuetify.breakpoint.sm
    }
  },
  methods: {
    ...mapActions('profile', ['getProfile']),
    cordovaBackButton () {
      this.close()
    },
    close (e) {
      if (e) e.preventDefault()
      this.$emit('close')
    }
  },
  watch: {
    'currentAccess.profileId': {
      immediate: true,
      async handler (profileId) {
        if (!profileId) return
        const profile = await this.getProfile(profileId)
          .catch(err => console.error(err))

        if (profile) this.currentAccessProfile = profile
      }
    }
  }
}
</script>
