<template>
  <Dialog :show="show" :title="title" width="55vw" :goBack="close" enableMenu :readonly="view"
    @submit="submit"
    @close="close"
  >
    <!-- FORM -->
    <template v-slot:content>
      <CollectionForm ref="collectionForm" :formData.sync="formData" :readonly="view" @edit="$emit('edit')"/>
      <v-col v-if="editing" class="pt-8" align="center">
        <v-btn text @click="$emit('delete')">
          Delete this Collection
          <v-icon class="pl-2">mdi-delete</v-icon>
        </v-btn>
      </v-col>
      <v-row v-if="view">
        <v-col v-if="access && access.length > 0" cols="auto" class="pb-0">
          <v-list-item-subtitle style="color:#a7a3a3">Access</v-list-item-subtitle>
          <AvatarGroup
            style="position:relative; bottom:15px; right:15px"
            :profiles="access"
            show-labels :size="'50px'"
            spacing="pr-2"
          />
        </v-col>
        <v-col v-if="collection.tiaki && collection.tiaki.length > 0" cols="auto" class="pb-0">
          <v-list-item-subtitle style="color:#a7a3a3">Kaitiaki</v-list-item-subtitle>
          <AvatarGroup
            style="position:relative; bottom:15px; right:15px"
            :profiles="collection.tiaki"
            show-labels :size="'50px'"
            spacing="pr-2"
          />
        </v-col>
      </v-row>
    </template>

    <template v-if="access" v-slot:before-actions>
      <AccessButton :access="access" @access="updateAccess" :disabled="editing || view" />
    </template>
  </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import CollectionForm from '@/components/archive/CollectionForm.vue'
import AccessButton from '@/components/button/AccessButton.vue'
import { getTribalProfile } from '@/lib/community-helpers.js'

import { mapGetters, mapActions, mapMutations } from 'vuex'

import { EMPTY_COLLECTION, setDefaultCollection } from '@/lib/collection-helpers.js'
import { getObjectChanges } from '@/lib/get-object-changes.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'
import AvatarGroup from '@/components/AvatarGroup.vue'

export default {
  name: 'NewCollectionDialog',
  components: {
    Dialog,
    CollectionForm,
    AccessButton,
    AvatarGroup
  },
  props: {
    show: { type: Boolean, required: true },
    collection: { type: Object, default () { return EMPTY_COLLECTION } },
    title: String,
    editing: Boolean,
    view: Boolean
  },
  data () {
    return {
      formData: setDefaultCollection(this.collection),
      access: null
    }
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile', 'tribe']
    })
  ],
  async mounted () {
    if (this.view) {
      // populate access
      const tribe = await this.getTribe(this.collection.recps[0])
      // get the profile of the tribe
      this.access = [getTribalProfile(tribe, this.whoami)]
    }
  },
  watch: {
    tribe: {
      deep: true,
      immediate: true,
      handler (tribe) {
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
      var output = {}

      if (this.editing) {
        output = {
          id: this.collection.id,
          ...getObjectChanges(setDefaultCollection(this.collection), this.formData)
        }
      } else {
        output = {
          ...getObjectChanges(setDefaultCollection(EMPTY_COLLECTION), this.formData),
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
