<template>
  <DialogContainer :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <RecordForm
        ref="recordForm"
        :editing="editing"
        :story.sync="formData"
        :collection="collection"
      />
      <v-col align="center">
        <v-btn v-if="editing" text @click="$emit('delete')">
          Delete this story
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>

    <template v-if="accessOptions && accessOptions.length" v-slot:before-actions>
      <AccessButton type="story" :accessOptions="accessOptions" :permission.sync="formData.permission"/>
    </template>
  </DialogContainer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import RecordForm from '@/components/archive/RecordForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import mapProfileMixins from '@/mixins/profile-mixins'
import { EMPTY_STORY, setDefaultStory } from '@/lib/story-helpers'
import { getObjectChanges } from '@/lib/get-object-changes'

export default {
  name: 'NewRecordDialog',
  components: {
    RecordForm,
    AccessButton
  },
  props: {
    show: { type: Boolean, required: true },
    story: { type: Object, default () { return EMPTY_STORY } },
    title: String,
    editing: { type: Boolean, default: false },
    collection: { type: Object, required: false }
  },
  data () {
    return {
      formData: setDefaultStory(this.story),
      profile: {},
      initial: false
    }
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  mounted () {
    this.initial = true
  },
  watch: {
    profile (profile) {
      if (!profile.id || this.editing) return

      this.formData.mentions = [profile]
      this.formData.contributors = [this.whoami.public.profile]
      this.formData.tiaki = [this.whoami.public.profile]
      this.formData.creators = []
      this.formData.relatedRecords = []
      this.formData.collections = (this.collection) ? [this.collection] : []
    },
    async currentAccess (access, prevAccess) {
      if (!access || this.editing) return

      const mentionProfile = (access.groupId === prevAccess.groupId || access.groupId === this.$route.params.tribeId)
        ? this.profile
        : await this.getProfile(access.profileId)

      this.formData.mentions = [mentionProfile]
      // TODO 2021-12-03 mentions, tiaki link to your group profile so people can click through
      this.formData.contributors = [this.whoami.public.profile]
      this.formData.tiaki = [this.whoami.public.profile]
      this.formData.creators = []
      this.formData.relatedRecords = []
      this.formData.collections = (this.collection) ? [this.collection] : []
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    ...mapGetters('tribe', ['accessOptions']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    ...mapActions('profile', ['getProfile']),
    close () {
      this.formData = setDefaultStory(this.story)
      this.$emit('close')
    },
    submit () {
      let output = {}
      if (this.editing) {
        // get all changes
        output = {
          id: this.story.id,
          ...getObjectChanges(setDefaultStory(this.story), this.formData)
        }
      } else {
        output = {
          ...getObjectChanges(setDefaultStory(EMPTY_STORY), this.formData),
          recps: [this.currentAccess.groupId]
        }
      }

      this.$emit('submit', output)
      this.close()
    }
  }
}
</script>

<style scoped lang="scss">
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
.close {
  top: -25px;
  right: -10px;
}
.big-avatar {
  position: relative;
  top: -20px;
}
.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}
</style>
