<template>
  <DialogContainer :title="title" :show="show" width="720px" :goBack="close" enableMenu>
    <template v-slot:content>
      <v-card-subtitle>
        <v-col v-if="isWhakapapaShow && !submitOnly" cols="12" sm="5" md="8">
          <v-radio-group v-model="removeProfile" column>
            <v-radio :label="t('whakapapaShow.hideProfile')" value="ignore"></v-radio>
            <v-radio :label="t('whakapapaShow.deleteProile')" value="delete"></v-radio>
          </v-radio-group>
        </v-col>
        <div class="warning-blurb">
          {{ confirmationMessage }}
          <span v-if="warnAboutChildren">
            {{ warnAboutChildrenMessage }}
          </span>
        </div>
      </v-card-subtitle>
      <v-textarea
        v-if="submitOnly"
        v-model="comment"
        :label="t('submission.comment')"
        no-resize
        rows="3"
        auto-grow
        outlined
        :placeholder="t('submission.commentText')"
        class="pa-4"
        hide-details
      ></v-textarea>
    </template>

    <template v-slot:actions>
      <v-col class="py-0" cols="12" md="auto" :style="mobile ? 'text-align:center;':''">
        <v-row>
          <v-col cols="6">
            <v-btn @click="close"
              text
              :large="!mobile"
              class="secondary--text"
            >
              {{ t('cancel') }}
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn @click="submit"
              :large="!mobile"
              text
              color="blue"
            >
              {{ deleteLabel }}
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </template>
  </DialogContainer>
</template>

<script>
import { get } from 'lodash-es'

// mode for the type of remove
const IGNORE = 'ignore'
const DELETE = 'delete'

// for the type of delete
const WHAKAPAPA_SHOW = 'whakapapaShow' // delete a person from a whakapapa
const PERSON_INDEX = 'personIndex' // delete a person from person index
const SUBMISSION = 'submission'

export default {
  name: 'RemovePersonDialog',
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, required: true },
    warnAboutChildren: { type: Boolean, default: true },
    submitOnly: Boolean
  },
  data () {
    return {
      removeProfile: IGNORE,
      comment: null
    }
  },
  mounted () {
    if (this.isPersonIndex || this.submitOnly) this.removeProfile = DELETE
  },
  computed: {
    title () {
      return this.t(
        this.submitOnly
          ? 'submission.title'
          : 'title',
        { preferredName: this.profile.preferredName }
      )
    },
    deleteLabel () {
      return this.submitOnly ? this.t('submission.deleteLabel') : this.t('deleteLabel')
    },
    context () {
      if (this.submitOnly) return SUBMISSION

      const name = get(this.$route, 'name')

      if (name === PERSON_INDEX) return PERSON_INDEX

      return WHAKAPAPA_SHOW
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    isWhakapapaShow () {
      return this.context === WHAKAPAPA_SHOW
    },
    isPersonIndex () {
      return this.context === PERSON_INDEX
    },
    confirmationMessage () {
      if (this.removeProfile === IGNORE && this.isWhakapapaShow && !this.submitOnly) return this.t('whakapapaShow.hideConfirmation')

      return this.t(`${this.context}.deleteConfirmation`)
    },
    warnAboutChildrenMessage () {
      return this.t(`${this.context}.warnAboutChildren`)
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      if (this.submitOnly) this.$emit('submit', this.comment)
      else this.$emit('submit', this.removeProfile)

      this.close()
    },
    t (key, vars) {
      return this.$t('deletePerson.' + key, vars)
    }
  }
}
</script>
