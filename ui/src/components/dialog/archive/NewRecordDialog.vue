<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <RecordForm ref="recordForm" :editing="editing" :formData.sync="formData" :access="access"/>
      <v-col align="center">
        <v-btn v-if="editing" text @click="$emit('delete')">
          Delete this record
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>

    <template v-if="access" v-slot:before-actions>
      <AccessButton :access="access" @access="updateAccess" :disabled="editing" />
    </template>
  </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import RecordForm from '@/components/archive/RecordForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import { mapGetters, mapActions } from 'vuex'

import { GET_CHANGES, EMPTY_STORY, setDefaultStory } from '@/lib/story-helpers.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

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
    editing: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: setDefaultStory(this.story),
      initial: false,
      access: null
    }
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['tribe']
    })
  ],
  watch: {
    tribe: {
      deep: true,
      immediate: true,
      handler (tribe) {
        this.access = tribe
        if (!tribe || this.whoami.personal.groupId === this.$route.params.tribeId) {
          this.access = { isPersonalGroup: true, groupId: this.whoami.personal.groupId, ...this.whoami.personal.profile }
          return
        }

        this.access = tribe
      }
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    updateAccess ($event) {
      console.log('access', $event)
      this.access = $event
    },
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
          ...GET_CHANGES(setDefaultStory(this.story), this.formData)
        }
      } else {
        output = {
          ...GET_CHANGES(setDefaultStory(EMPTY_STORY), this.formData),
          recps: [this.access.groupId]
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
