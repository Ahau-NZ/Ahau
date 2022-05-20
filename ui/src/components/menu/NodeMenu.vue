<template>
  <VueContext ref="menu" class="px-0">
    <li>
      <a href="#" @click.prevent="updateDialog('view-edit-node', null)"  class="d-flex align-center px-4">
        <img class="contextMenuIcon" :src="require('@/assets/account-circle.svg')"/>
        <p class="ma-0 pl-3">{{ t('viewPerson') }}</p>
      </a>
    </li>
    <li v-for="option in options" :key="option.dialog + option.type">
      <a v-if="option.isPermitted" href="#" @click.prevent="updateDialog(option.dialog, option.type)" class="d-flex align-center px-4">
        <v-icon v-if="option.dialog === 'delete-node'" class="contextMenuIcon black--text">
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
import findSuccessor from '@/lib/find-successor'

export default {
  name: 'NodeMenu',
  props: {},
  components: {
    VueContext
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('person', ['person', 'selectedProfile']),
    ...mapGetters('whakapapa', ['whakapapaView', 'focus']),
    ...mapGetters('tree', ['mouseEvent', 'searchedProfileId']),
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
    options () {
      return [
        {
          title: this.t('addParent'),
          dialog: 'new-node',
          type: 'parent',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('@/assets/node-parent.svg')
        },
        {
          title: this.t('addPartner'),
          dialog: 'new-node',
          type: 'partner',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('@/assets/node-partner.svg')
        },
        {
          title: this.t('addChild'),
          dialog: 'new-node',
          type: 'child',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('@/assets/node-child.svg')
        },
        {
          title: this.t('addSibling'),
          dialog: 'new-node',
          type: 'sibling',
          isPermitted: this.canAddSibling,
          icon: require('@/assets/node-sibling.svg')
        },
        {
          title: this.t('deletePerson'),
          dialog: 'delete-node',
          type: null,
          isPermitted: this.canDelete,
          icon: 'mdi-delete'
        }
      ]
    }
  },
  watch: {
    mouseEvent (e) {
      this.updateDialog(null, null)
      if (this.searchedProfileId) return
      this.open(e)
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
@import "~vue-context/dist/css/vue-context.css";

.contextMenuIcon {
    width: 20px;
    height: 20px;
    color: black;
}
</style>
