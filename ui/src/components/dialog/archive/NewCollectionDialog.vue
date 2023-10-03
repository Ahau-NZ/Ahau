<template>
  <DialogContainer :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <CollectionForm ref="collectionForm" :collection.sync="formData" @edit="$emit('edit')"/>
      <v-col v-if="editing" class="pt-8" align="center">
        <v-btn text @click="$emit('delete')">
          Delete this Collection
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </template>

    <template v-if="accessOptions && accessOptions.length" v-slot:before-actions>
      <AccessButton type="collection" :accessOptions="accessOptions" disabled permission="view"  />
    </template>
  </DialogContainer>
</template>

<script>
import { cloneDeep as clone } from 'lodash-es'
import { mapGetters, mapActions } from 'vuex'

import CollectionForm from '@/components/archive/CollectionForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import { getObjectChanges } from '@/lib/get-object-changes'
import mapProfileMixins from '@/mixins/profile-mixins'

function setDefaultCollection (newCollection) {
  const collection = clone(newCollection)

  let { stories } = collection

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
      formData: setDefaultCollection(this.collection)
    }
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],

  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    ...mapGetters('tribe', ['accessOptions']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    close () {
      this.formData = setDefaultCollection(this.collection)
      this.$emit('close')
    },
    submit () {
      let output = {}

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
