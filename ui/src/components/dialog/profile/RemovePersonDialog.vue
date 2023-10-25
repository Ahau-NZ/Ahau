<template>
  <DialogContainer :title="title" :show="show" width="720px" :goBack="close" enableMenu>
    <template v-slot:content>
      <v-card-subtitle>
        <v-col v-if="isWhakapapaShow || submitOnly" cols="12" sm="5" md="9">
          <v-radio-group v-model="action" column>
            <v-radio :label="ignoreOptionLabel" value="ignore"></v-radio>
            <v-radio :label="deleteOptionLabel" value="delete"></v-radio>
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
      />
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
              {{ submitButtonLabel }}
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </template>
  </DialogContainer>
</template>

<script>
import { get } from 'lodash-es'

import { getDisplayName } from '@/lib/person-helpers'
import {
  // modes for the type of remove
  IGNORE,
  DELETE
} from '@/lib/constants'

// for the type of delete
const WHAKAPAPA_SHOW = 'whakapapaShow' // delete a person from a whakapapa
const PERSON_INDEX = 'personIndex' // delete a person from person index
const SUBMISSION = 'submission' // submission to delete or ignore a person

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
      action: IGNORE,
      comment: null
    }
  },
  mounted () {
    if (this.isPersonIndex) this.action = DELETE
  },
  computed: {
    submitButtonLabel () {
      return this.t(`${this.context}.buttonLabel.${this.action}`)
    },
    ignoreOptionLabel () {
      return this.t(`${this.context}.options.ignore`)
    },
    deleteOptionLabel () {
      return this.t(`${this.context}.options.delete`)
    },
    title () {
      return this.t(
        `${this.context}.title.${this.action}`,
        { name: getDisplayName(this.profile) }
      )
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
      return this.t(`${this.context}.confirmation.${this.action}`)
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
      if (this.submitOnly) this.$emit('submit', { action: this.action, comment: this.comment })
      else this.$emit('submit', this.action)

      this.close()
    },
    t (key, vars) {
      return this.$t('deletePerson.' + key, vars)
    }
  }
}
</script>
