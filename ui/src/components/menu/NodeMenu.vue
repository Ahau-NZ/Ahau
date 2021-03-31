<template>
  <VueContext ref="menu" class="px-0">
    <li>
      <a href="#" @click.prevent="updateDialog('view-edit-node', null)"  class="d-flex align-center px-4">
        <img class="contextMenuIcon" :src="require('@/assets/account-circle.svg')"/>
        <p class="ma-0 pl-3">View Person</p>
      </a>
    </li>
    <li v-for="(option, index) in options" :key="index">
      <a v-if="option.isPermitted" href="#" @click.prevent="updateDialog(option.dialog, option.type)" class="d-flex align-center px-4">
        <v-icon v-if="option.icon === 'mdi-delete'" class="contextMenuIcon black--text"> {{ option.icon }}</v-icon>
        <img v-else class="contextMenuIcon" :src="option.icon"/>
        <p class="ma-0 pl-3">{{ option.title }}</p>
      </a>
    </li>
  </VueContext>
</template>

<script>
import { VueContext } from 'vue-context'
import { mapGetters } from 'vuex'
import findSuccessor from '@/lib/find-successor'

export default {
  name: 'NodeMenu',
  props: {
    view: Object
  },
  components: {
    VueContext
  },
  computed: {
    ...mapGetters(['selectedProfile', 'whoami']),
    canEdit () {
      return this.selectedProfile && this.selectedProfile.canEdit
    },
    canDelete () {
      if (!this.canEdit) return false

      // not allowed to delete own profile
      if (this.selectedProfile.id === this.whoami.public.profile.id) return false
      if (this.selectedProfile.id === this.whoami.personal.profile.id) return false

      // if deleting the focus (top ancestor)
      if (this.selectedProfile.id === this.view.focus) {
        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(this.selectedProfile))
      }

      return true
    },
    canAddSibling () {
      if (!this.selectedProfile) return false

      // if adding a sibling to the focus
      return this.selectedProfile.id !== this.view.focus
    },
    options () {
      return [
        {
          title: 'Add Parent',
          dialog: 'new-node',
          type: 'parent',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('@/assets/node-parent.svg')
        },
        {
          title: 'Add Partner',
          dialog: 'new-node',
          type: 'partner',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('@/assets/node-partner.svg')
        },
        {
          title: 'Add Child',
          dialog: 'new-node',
          type: 'child',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('@/assets/node-child.svg')
        },
        {
          title: 'Add Sibling',
          dialog: 'new-node',
          type: 'sibling',
          isPermitted: this.canAddSibling,
          icon: require('@/assets/node-sibling.svg')
        },
        {
          title: 'Delete Person',
          dialog: 'delete-node',
          type: null,
          isPermitted: this.canDelete,
          icon: 'mdi-delete'
        }
      ]
    }
  },
  methods: {
    updateDialog (dialog, type) {
      this.$emit('open', { dialog, type })
    },
    open (e) {
      this.$refs.menu.open(e)
    }
  }
}
</script>

<style lang="scss">
@import "~vue-context/dist/css/vue-context.css";

.contextMenuIcon {
    width: 20px;
    height: 20px;
    color: black;
}
</style>
