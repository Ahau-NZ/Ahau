<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <CollectionForm ref="collectionForm" :formData.sync="formData"/>
    </template>

    <template v-if="access" v-slot:before-actions>
      <AccessButton :access="access" @access="updateAccess" />
    </template>
  </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import CollectionForm from '@/components/archive/CollectionForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import { mapGetters, mapActions, mapMutations } from 'vuex'

import { EMPTY_COLLECTION, setDefaultCollection } from '@/lib/collection-helpers.js'
import { getObjectChanges } from '@/lib/get-object-changes.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

export default {
  name: 'NewCollectionDialog',
  components: {
    Dialog,
    CollectionForm,
    AccessButton
  },
  props: {
    show: { type: Boolean, required: true },
    collection: { type: Object, default () { return EMPTY_COLLECTION } },
    title: String
  },
  data () {
    return {
      formData: setDefaultCollection(this.collection),
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
      handler (tribe, oldTribe) {
        if (!tribe || this.whoami.personal.groupId === this.$route.params.tribeId) {
          this.access = { isPersonalGroup: true, groupId: this.whoami.personal.groupId, ...this.whoami.personal.profile }
          return
        }

        this.access = {
          ...tribe.private.length > 0
            ? tribe.private[0]
            : tribe.public[0],
          groupId: tribe.id
        }

        this.setCurrentAccess(this.access)
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
    ...mapMutations(['setCurrentAccess']),
    ...mapActions(['setDialog']),
    updateAccess ($event) {
      this.access = $event
      this.setCurrentAccess(this.access)
    },
    close () {
      this.formData = setDefaultCollection(this.collection)
      this.$emit('close')
    },
    submit () {
      const output = {
        ...getObjectChanges(setDefaultCollection(EMPTY_COLLECTION), this.formData),
        recps: [this.access.groupId]
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
