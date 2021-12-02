<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <CollectionForm ref="collectionForm" :formData.sync="formData" @edit="$emit('edit')"/>
      <v-col v-if="editing" class="pt-8" align="center">
        <v-btn text @click="$emit('delete')">
          Delete this Collection
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>

    <template v-if="accessOptions.length" v-slot:before-actions>
      <AccessButton type="collection" :accessOptions="accessOptions" :disabled="editing"  />
    </template>
  </Dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import clone from 'lodash.clonedeep'

import Dialog from '@/components/dialog/Dialog.vue'
import CollectionForm from '@/components/archive/CollectionForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import { getObjectChanges } from '@/lib/get-object-changes.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

import { ACCESS_PRIVATE, ACCESS_ALL_MEMBERS } from '@/lib/constants'

function setDefaultCollection (newCollection) {
  var collection = clone(newCollection)

  var { stories } = collection

  if (stories && stories.length > 0) {
    stories = stories.map(d => {
      return {
        ...d.story,
        linkId: d.linkId
      }
    })
  }

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    image: collection.image,
    stories
  }
}

const EMPTY_COLLECTION = {
  id: null,
  name: null,
  description: null,
  image: null,
  stories: [],
  recordCount: 0
}

export default {
  name: 'NewCollectionDialog',
  // TODO 2021-12-03 rename as this is New+Edit
  components: {
    Dialog,
    CollectionForm,
    AccessButton
  },
  props: {
    show: { type: Boolean, required: true },
    collection: { type: Object, default () { return EMPTY_COLLECTION } },
    title: String,
    editing: Boolean
  },
  data () {
    return {
      formData: setDefaultCollection(this.collection),
      accessOptions: []
    }
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile', 'tribe']
    })
  ],

  watch: {
    tribe: {
      deep: true,
      immediate: true,
      handler (tribe) {
        if (this.whoami.personal.groupId === this.$route.params.tribeId) {
          this.accessOptions = [{
            type: ACCESS_PRIVATE,
            groupId: this.whoami.personal.groupId,
            profileId: this.whoami.personal.profile.id
          }]
        } // eslint-disable-line
        else {
          if (!tribe) return

          const profileId = (tribe.private[0] || tribe.public[0]).id
          this.accessOptions = [
            {
              type: ACCESS_ALL_MEMBERS,
              groupId: tribe.id,
              profileId // community profileId
            }
            /* NOTE - currently don't have kaitiaki-only collections set up */
            // {
            //   type: ACCESS_KAITIAKI,
            //   groupId: tribe.admin.id,
            //   profileId // community profileId
            // }
          ]
        }

        this.setCurrentAccess(this.accessOptions[0])
      }
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions(['setDialog', 'setCurrentAccess']),
    close () {
      this.formData = setDefaultCollection(this.collection)
      this.$emit('close')
    },
    submit () {
      var output = {}

      if (this.editing) {
        output = {
          id: this.collection.id,
          ...getObjectChanges(setDefaultCollection(this.collection), this.formData)
        }
      } else {
        output = {
          ...getObjectChanges(setDefaultCollection(EMPTY_COLLECTION), this.formData),
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
