<template>
  <div>
    <Tree :nestedWhakapapa="nestedWhakapapa"
      :view="whakapapaView"
      :profiles="profiles"

      @load-descendants="loadDescendants($event)"
      @collapse-node="collapseNode($event)"
      @open-context-menu="openContextMenu($event)"
    />

    <vue-context ref="menu">
      <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a href="#" @click.prevent="option.action"> {{ option.title }} </a>
      </li>
      <li v-if="canDelete">
        <a href="#" @click.prevent="toggleDelete"> Delete Person </a>
      </li>
    </vue-context>

    <!--
      <ViewNodeDialog v-if="dialog.show" :show="dialog.show" :node="node.selected"
      @close="toggleShow"/>
      // NOTE node.selected has changed
    -->
    <EditNodeDialog v-if="dialog.edit" :show="dialog.edit"
      @close="toggleEdit"/>
    <NewNodeDialog v-if="dialog.new" :show="dialog.new"
      @close="toggleNew" @submit="addPerson($event)"/>
    <DeleteNodeDialog v-if="dialog.delete" :show="dialog.delete" :name="selectedProfile.preferredName"
      @close="toggleDelete" @submit="deleteProfile" />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { VueContext } from 'vue-context'

import Tree from '@/components/Tree.vue'
import tree from '@/lib/tree-helpers'

// import ViewNodeDialog from '@/components/tree/Dialogs/ViewNodeDialog.vue'
import EditNodeDialog from '@/components/tree/Dialogs/EditNodeDialog.vue'
import NewNodeDialog from '@/components/tree/Dialogs/NewNodeDialog.vue'
import DeleteNodeDialog from '@/components/tree/Dialogs/DeleteNodeDialog.vue'

const saveWhakapapaRelMutation = (input) => ({
  mutation: gql`mutation ($input: WhakapapaRelationInput!) {
    saveWhakapapaRelation(input: $input)
  }`,
  variables: { input }
})

const saveWhakapapaViewMutation = (input) => ({
  mutation: gql`mutation ($input: WhakapapaViewInput) {
    saveWhakapapaView(input: $input)
  }`,
  variables: { input }
})

export default {
  data () {
    return {
      whakapapaView: {
        name: 'Loading',
        description: '',
        focus: '',
        // mode: 'descendants',
        recps: null
      },
      // the record which defines the starting point for a tree (the 'focus')

      whoami: {
        profile: { id: '' }
      },
      // my profile id, to ensure we don't delete our own profile

      profiles: {},
      // a dictionary which maps profileIds > profiles
      // this is a store for lookups, and from which we build up nestedWhakapapa

      selectedProfile: null,
      dialog: {
        new: false,
        show: false,
        edit: false,
        delete: false,
        type: 'child'
      },
      contextMenuOpts: [
        { title: 'Add Child', action: this.toggleNewChild },
        { title: 'Add Parent', action: this.toggleNewParent },
        { title: 'Edit Person', action: this.toggleEdit }
      ]
      // all the guff currently needed for context menus
    }
  },
  apollo: {
    whakapapaView () {
      return {
        query: gql` query ($id: String!) {
          whakapapaView(id: $id) {
            name
            description
            focus
            recps
          }
        }`,
        variables: { id: this.$route.params.id },
        fetchPolicy: 'no-cache'
      }
    },
    whoami: {
      query: gql` {
        whoami {
          profile { id }
        }
      }`,
      fetchPolicy: 'no-cache'
    }
  },
  computed: {
    nestedWhakapapa () {
      var startingProfile = this.profiles[this.whakapapaView.focus]
      if (!startingProfile) {
        return {
          preferredName: 'Loading',
          gender: 'unknown',
          children: [],
          parents: []
        }
      }

      return tree.hydrate(startingProfile, this.profiles)
    },
    canDelete () {
      if (!this.selectedProfile) return false

      if (this.selectedProfile.id === this.whoami.profile.id) return false
      if (this.selectedProfile.id === this.whakapapaView.focus) return false

      return true
    }
  },
  watch: {
    'whakapapaView.focus': async function (newFocus) {
      this.loadDescendants(newFocus)
    }
  },
  methods: {
    async loadDescendants (profileId) {
      const result = await this.getCloseWhakapapa(profileId)
      const record = result.data.closeWhakapapa

      record.children.forEach(profile => {
        this.loadDescendants(profile.id)
      })

      var output = Object.assign({}, this.profiles)
      Object.entries(tree.flatten(record))
        .forEach(([ profileId, profile ]) => {
          output[profileId] = Object.assign({}, output[profileId] || {}, profile)
          // this merge might be overwriting a lot
        })

      const parentIds = record.parents.map(profile => profile.id)
      parentIds.map(parentId => {
        if (!output[parentId]) return

        const currentPartners = output[parentId].partners || []
        const partners = new Set([...currentPartners, ...parentIds])
        partners.delete(parentId)
        output[parentId].partners = Array.from(partners)
      })

      this.profiles = output
    },
    async getCloseWhakapapa (profileId) {
      const request = {
        query: gql`query ($id: String) {
          closeWhakapapa(id: $id) {
            id
            gender
            preferredName
            avatarImage {
              uri
            }
            children {
              id
              gender
              preferredName
              avatarImage {
                uri
              }
            }
            parents {
              id
              gender
              preferredName
              avatarImage {
                uri
              }
            }
          }
        }`,
        variables: {
          id: profileId
        },
        fetchPolicy: 'no-cache'
      }

      try {
        const result = await this.$apollo.query(request)
        return result
      } catch (err) {
        console.error('WARNING, something went wrong')
        console.error(err)
        return err
      }
    },
    collapseNode (profileId) {
      const profile = this.profiles[profileId]
      const { children, _children = [] } = profile

      if (children.length === 0 && _children.length === 0) return

      this.profiles[profileId] = Object.assign(profile, {
        isCollapsed: !profile.isCollapsed,
        _children: children,
        children: _children
      })
    },

    // contextMenu //////////////////////////
    // TODO - extract all this
    openContextMenu ({ event, profileId }) {
      this.selectedProfile = this.profiles[profileId]
      this.$refs.menu.open(event)
    },
    // toggleShow (target) {
    //   this.node.selected = target
    //   this.dialog.show = !this.dialog.show
    // },
    toggleEdit () {
      // TEMP - use the UI we have!
      this.$router.push({ name: 'personEdit', params: { id: this.selectedProfile.id } })

      // this.dialog.edit = !this.dialog.edit
    },
    toggleDelete () {
      this.dialog.delete = !this.dialog.delete
    },
    toggleNewChild () {
      this.dialog.type = 'child'
      this.toggleNew()
    },
    toggleNewParent () {
      this.dialog.type = 'parent'
      this.toggleNew()
    },
    toggleNew () {
      this.dialog.new = !this.dialog.new
    },
    async addPerson ($event) {
      try {
        const profileId = await this.createProfile($event)
        if (!profileId) return

        let child, parent
        const relationshipAttrs = pick($event, ['relationshipType', 'legallyAdopted'])
        switch (this.dialog.type) {
          case 'child':
            child = profileId
            parent = this.selectedProfile.id
            await this.createChildLink({ child, parent, ...relationshipAttrs })
            this.loadDescendants(parent)
            break
          case 'parent':
            child = this.selectedProfile.id
            parent = profileId
            const linkId = await this.createChildLink({ child, parent, ...relationshipAttrs })
            if (!linkId) return

            if (child === this.whakapapaView.focus) {
              // in this case we're updating the top of the graph, we update view.focus to that new top parent
              await this.updateFocus(parent)
            } else {
              this.loadDescendants(child)
            }
            break
          default: console.log('not built')
        }
        this.dialog.new = false
      } catch (err) {
        throw err
      }
    },
    async createProfile ({ preferredName, legalName, gender }) {
      const res = await this.$apollo.mutate({
        mutation: gql`mutation ($input: CreateProfileInput!) {
          createProfile(input: $input)
        }`,
        variables: {
          input: {
            type: 'person',
            preferredName,
            legalName,
            gender,
            recps: this.whakapapaView.recps
            // avatarImage: ImageInput
          }
        }
      })

      if (res.errors) {
        console.error('failed to createProfile', res)
        return
      }
      return res.data.createProfile // a profileId
    },
    async createChildLink ({ child, parent, relationshipType, legallyAdopted }, view) {
      const input = {
        child,
        parent,
        relationshipType,
        legallyAdopted,
        recps: this.whakapapaView.recps
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaRelMutation(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        }
        return res // TODO return the linkId
      } catch (err) {
        throw err
      }
    },
    async updateFocus (focus) {
      const input = {
        viewId: this.whakapapaView.id,
        focus
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaViewMutation(input))
        if (res.data) this.whakapapaView.focus = focus
        else console.error(res)
      } catch (err) {
        throw err
      }
    },
    async deleteProfile () {
      if (!this.canDelete) return
      const profileId = this.selectedProfile.id

      const res = await this.$apollo.mutate({
        mutation: gql`mutation ($input: UpdateProfileInput!) {
          updateProfile(input: $input)
        }`,
        variables: {
          input: {
            id: profileId,
            tombstone: { date: new Date() }
          }
        }
      })

      if (res.errors) {
        console.error('failed to delete profile', res)
        return
      }

      this.profiles = {}
      this.loadDescendants(this.whakapapaView.focus)
      // TODO - find a smaller subset to reload!
    }
    //
    // contextMenu //////////////////////////

  },
  components: {
    Tree,
    VueContext,
    EditNodeDialog,
    NewNodeDialog,
    DeleteNodeDialog
    // ViewNodeDialog
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
</style>
