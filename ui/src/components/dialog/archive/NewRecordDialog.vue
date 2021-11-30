<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <RecordForm
        ref="recordForm"
        :editing="editing"
        :formData.sync="formData"
        :access="access"
        :collection="collection"
      />
      <v-col align="center">
        <v-btn v-if="editing" text @click="$emit('delete')">
          Delete this story
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>

    <template v-if="access" v-slot:before-actions>
      <AccessButton :accessOptions="accessOptions" @access="setCurrentAccess" :disabled="editing" type="story" />
    </template>
  </Dialog>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'

import Dialog from '@/components/dialog/Dialog.vue'
import RecordForm from '@/components/archive/RecordForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import { ACCESS_PRIVATE, ACCESS_ALL_MEMBERS, ACCESS_KAITIAKI } from '@/lib/constants'
import mapProfileMixins from '@/mixins/profile-mixins.js'
import { EMPTY_STORY, setDefaultStory } from '@/lib/story-helpers.js'
import { getObjectChanges } from '@/lib/get-object-changes.js'

export default {
  name: 'NewRecordDialog',
  components: {
    Dialog,
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
      tribe: null,
      formData: setDefaultStory(this.story),
      profile: {},
      initial: false,
      accessOptions: []
    }
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile', 'tribe'],
      mapMethods: ['getProfile']
    })
  ],
  mounted () {
    this.initial = true
  },
  watch: {
    tribe: {
      deep: true,
      immediate: true,
      handler (tribe, oldTribe) {
        if (this.whoami.personal.groupId === this.$route.params.tribeId) {
          this.accessOptions = [{
            type: ACCESS_PRIVATE,
            groupId: this.whoami.personal.groupId,
            profileId: this.whoami.personal.profile.id
          }]
        } // eslint-disable-line
        else {
          if (!tribe) return

          const profileId = (tribe.private && tribe.private.length ? tribe.private[0] : tribe.public[0]).id
          this.accessOptions = [
            {
              type: ACCESS_ALL_MEMBERS,
              groupId: tribe.id,
              profileId // community profileId
            },
            {
              type: ACCESS_KAITIAKI,
              groupId: tribe.admin.id,
              profileId // community profileId
            }
          ]
        }

        this.setCurrentAccess(this.accessOptions[0])
      }
    },
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
      // TODO ideally link to your group profile instead
      this.formData.contributors = [this.whoami.public.profile]
      this.formData.tiaki = [this.whoami.public.profile]
      this.formData.creators = []
      this.formData.relatedRecords = []
      this.formData.collections = (this.collection) ? [this.collection] : []
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapMutations(['setCurrentAccess']),
    ...mapActions(['setDialog']),
    close () {
      this.formData = setDefaultStory(this.story)
      this.$emit('close')
    },
    submit () {
      var output = {}
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
