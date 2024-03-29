<template>
  <VueContext ref="menu" class="px-0">
    <li>
      <a href="#" @click.prevent="updateDialog('view-edit-person', null)"  class="d-flex align-center px-4">
        <img class="contextMenuIcon" :src="accountCircleURL"/>
        <p class="ma-0 pl-3">{{ t('viewPerson') }}</p>
      </a>
    </li>
    <li v-for="option in options" :key="option.dialog + option.type">
      <a v-if="option.isPermitted" href="#" @click.prevent="updateDialog(option.dialog, option.type)" class="d-flex align-center px-4">
        <v-icon v-if="option.dialog === 'delete-person'" class="contextMenuIcon black--text">
          {{ option.icon }}
        </v-icon>
        <img v-else class="contextMenuIcon" :src="option.icon"/>

        <p class="ma-0 pl-3">{{ option.title }}</p>
      </a>
    </li>
  </VueContext>
</template>

<script>
import { VueContext } from 'vue-context'
import { mapGetters } from 'vuex'

import accountCircleURL from '@/assets/account-circle.svg'
import findSuccessor from '@/lib/find-successor'
import nodeParentURL from '@/assets/node-parent.svg'
import nodePartnerURL from '@/assets/node-partner.svg'
import nodeChildURL from '@/assets/node-child.svg'
import nodeSiblingURL from '@/assets/node-sibling.svg'

export default {
  name: 'NodeMenu',
  props: {},
  data () {
    return {
      accountCircleURL
    }
  },
  components: {
    VueContext
  },
  computed: {
    ...mapGetters(['whoami', 'isKaitiaki']),
    ...mapGetters('person', ['person', 'selectedProfile']),
    ...mapGetters('whakapapa', ['whakapapaView', 'focus']),
    ...mapGetters('tree', ['mouseEvent', 'searchedProfileId']),
    isSubmitOnly () {
      return !this.isKaitiaki && this.whakapapaView?.permission === 'submit'
    },
    canEdit () {
      return this.selectedProfile && this.selectedProfile.canEdit
    },
    canDelete () {
      if (!this.canEdit) return false

      // not allowed to delete own profile
      if (this.selectedProfile.id === this.whoami.public.profile.id) return false
      if (this.selectedProfile.id === this.whoami.personal.profile.id) return false

      // if deleting the focus (top ancestor)
      if (this.selectedProfile.id === this.whakapapaView.focus) {
        if (this.isSubmitOnly) return false

        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(this.selectedProfile))
      }

      return true
    },
    canAddSibling () {
      if (!this.selectedProfile) return false

      return (
        this.selectedProfile.id !== this.whakapapaView.focus &&
        this.selectedProfile.id !== this.focus &&
        this.selectedProfile.parents.length > 0
      )
    },
    // this is used to disable adding a parent to the focus in a whakapapaView that is submit-only
    // this is because we havent covered that edge case yet, so temporarily disabling it here
    canAddParent () {
      if (!this.selectedProfile) return false
      if (!this.isSubmitOnly) return true

      if (this.selectedProfile.id === this.whakapapaView.focus) return false

      return true
    },
    options () {
      return [
        {
          title: this.t('addParent'),
          dialog: 'new-person',
          type: 'parent',
          isPermitted: this.canAddParent,
          icon: nodeParentURL
        },
        {
          title: this.t('addPartner'),
          dialog: 'new-person',
          type: 'partner',
          isPermitted: Boolean(this.selectedProfile),
          icon: nodePartnerURL
        },
        {
          title: this.t('addChild'),
          dialog: 'new-person',
          type: 'child',
          isPermitted: Boolean(this.selectedProfile),
          icon: nodeChildURL
        },
        {
          title: this.t('addSibling'),
          dialog: 'new-person',
          type: 'sibling',
          isPermitted: this.canAddSibling,
          icon: nodeSiblingURL
        },
        {
          title: this.t('deletePerson'),
          dialog: 'delete-person',
          type: null,
          isPermitted: this.canDelete,
          icon: 'mdi-delete'
        }
      ]
    }
  },
  watch: {
    mouseEvent: {
      deep: true,
      handler (e) {
        this.updateDialog(null, null)
        this.open(e)
      }
    }
  },
  methods: {
    updateDialog (dialog, type) {
      this.$emit('open', { dialog, type })
    },
    open (e) {
      this.$refs.menu.open(e)
    },
    t (key, vars) {
      return this.$t('nodeMenu.' + key, vars)
    }
  }
}
</script>

<style lang="scss">
@import "vue-context/dist/css/vue-context.css";

.contextMenuIcon {
    width: 20px;
    height: 20px;
    color: black;
}
</style>
