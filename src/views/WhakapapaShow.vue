<template>
  <div>
    <Tree
      :view="whakapapaView"
      :nestedWhakapapa="nestedWhakapapa"
      @load-descendants="loadDescendants($event)"
      @collapse-node="collapseNode($event)"
      @open-context-menu="openContextMenu($event)"
    />

    <vue-context ref="menu">
      <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a href="#" @click.prevent="option.action">{{ option.title }}</a>
      </li>
      <li v-if="canDelete">
        <a href="#" @click.prevent="toggleDelete">Delete Person</a>
      </li>
    </vue-context>

    <ViewEditNodeDialog
      v-if="dialog.view"
      :show="dialog.view"
      :profile="selectedProfile"
      @close="toggleView"
      @new="toggleNewPerson($event)"
      @submit="updateProfile($event)"
      @delete="deleteProfile()"
    />
    <NewNodeDialog
      v-if="dialog.new"
      :show="dialog.new"
      :type="dialog.type"
      :title="selectedProfile.preferredName"
      @close="toggleNew"
      @submit="addPerson($event)"
    />
    <DeleteNodeDialog
      v-if="dialog.delete"
      :show="dialog.delete"
      :name="selectedProfile.preferredName"
      @close="toggleDelete"
      @submit="deleteProfile"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { VueContext } from 'vue-context'

import Tree from '@/components/Tree.vue'
import ViewEditNodeDialog from '@/components/tree/Dialogs/ViewEditNodeDialog.vue'
import NewNodeDialog from '@/components/tree/Dialogs/NewNodeDialog.vue'
import DeleteNodeDialog from '@/components/tree/Dialogs/DeleteNodeDialog.vue'

// const tree = require('@/lib/tree-helpers.js')
import tree from '@/lib/tree-helpers'

const saveWhakapapaRelMutation = input => ({
  mutation: gql`
    mutation($input: WhakapapaRelationInput!) {
      saveWhakapapaRelation(input: $input)
    }
  `,
  variables: { input }
})

const saveWhakapapaViewMutation = input => ({
  mutation: gql`
    mutation($input: WhakapapaViewInput) {
      saveWhakapapaView(input: $input)
    }
  `,
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

      recordQueue: [],
      processingQueue: false,

      selectedProfile: null,
      dialog: {
        new: false,
        view: false,
        delete: false,
        type: 'child'
      },
      contextMenuOpts: [
        { title: 'View Person', action: this.toggleView },
        { title: 'Add Child', action: this.toggleNewChild },
        { title: 'Add Parent', action: this.toggleNewParent }
      ]
      // all the guff currently needed for context menus
    }
  },
  apollo: {
    whakapapaView () {
      return {
        query: gql`
          query($id: String!) {
            whakapapaView(id: $id) {
              name
              description
              focus
              recps
            }
          }
        `,
        variables: { id: this.$route.params.id },
        fetchPolicy: 'no-cache'
      }
    },
    whoami: {
      query: gql`
        {
          whoami {
            profile {
              id
            }
          }
        }
      `,
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
      if (newFocus) this.loadDescendants(newFocus)
    },
    processingQueue: function (isProcessing) {
      if (!isProcessing) return

      while (this.recordQueue.length) {
        const record = this.recordQueue.shift()

        var output = Object.assign({}, this.profiles)

        // flatten out record and merge into current profiles
        Object.entries(tree.flatten(record)).forEach(([profileId, profile]) => {
          output[profileId] = Object.assign(
            {},
            output[profileId] || {},
            profile
          )
          // this merge might be overwriting a lot
        })

        // populate the "partners" field of each parent
        const parentIds = record.parents.map(link => link.profile.id)
        parentIds.forEach(parentId => {
          if (!output[parentId]) return

          const currentPartners = output[parentId].partners || []
          const partners = new Set([...currentPartners, ...parentIds])
          partners.delete(parentId)
          output[parentId].partners = Array.from(partners)
        })

        this.profiles = Object.assign({}, this.profiles, output)
      }

      this.processingQueue = false
    }
  },
  methods: {
    async loadDescendants (profileId) {
      // fetch close whakapapa records for this profile
      const record = await this.getRelatives(profileId)
      if (!record) return

      // if (whakapapaView.mode === 'descendants')
      // follow the child-links and load the next generation
      record.children.forEach(child => {
        this.loadDescendants(child.profile.id)
      })

      // add this to queue of records to process and merge into graph
      // so that we don't get collisions / overwrites
      this.recordQueue = [...this.recordQueue, record]
      if (!this.processingQueue) this.processingQueue = true
    },
    async getRelatives (profileId) {
      const request = {
        query: gql`
          query($id: String!) {
            person(id: $id) {
              id
              gender
              bornAt
              diedAt
              legalName
              preferredName
              description
              avatarImage {
                uri
              }
              children {
                profile {
                  id
                  gender
                  legalName
                  preferredName
                  bornAt
                  diedAt
                  description
                  avatarImage {
                    uri
                  }
                }
                relationshipType
              }

              parents {
                profile {
                  id
                  gender
                  legalName
                  preferredName
                  bornAt
                  diedAt
                  description
                  avatarImage {
                    uri
                  }
                }
                relationshipType
              }
            }
          }
        `,
        variables: {
          id: profileId
        },
        fetchPolicy: 'no-cache'
      }

      try {
        const result = await this.$apollo.query(request)
        if (result.errors) {
          console.error('WARNING, something went wrong')
          console.error(result.errors)
          return
        }
        return result.data.person
      } catch (e) {
        console.error('WARNING, something went wrong, caught it')
        console.error(e)
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
      this.setSelectedProfile(profileId)
      this.$refs.menu.open(event)
    },
    toggleView () {
      this.dialog.view = !this.dialog.view
    },
    toggleDelete () {
      this.dialog.delete = !this.dialog.delete
    },
    toggleNewChild () {
      this.toggleNewPerson('child')
    },
    toggleNewParent () {
      this.toggleNewPerson('parent')
    },
    toggleNewPerson (type) {
      this.dialog.type = type
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
        const relationshipAttrs = pick($event, [
          'relationshipType',
          'legallyAdopted'
        ])
        switch (this.dialog.type) {
          case 'child':
            child = profileId
            parent = this.selectedProfile.id
            await this.createChildLink({ child, parent, ...relationshipAttrs })
            await this.loadDescendants(parent)
            break
          case 'parent':
            child = this.selectedProfile.id
            parent = profileId
            const linkId = await this.createChildLink({
              child,
              parent,
              ...relationshipAttrs
            })
            if (!linkId) return

            if (child === this.whakapapaView.focus) {
              // in this case we're updating the top of the graph, we update view.focus to that new top parent
              await this.updateFocus(parent)
            } else {
              await this.loadDescendants(child)
            }
            break
          default:
            console.log('not built')
        }
        this.dialog.new = false
        if (this.dialog.view) {
          this.setSelectedProfile(this.selectedProfile.id)
        }
      } catch (err) {
        throw err
      }
    },
    async createProfile ({ preferredName, legalName, gender, bornAt, diedAt, avatarImage }) {
      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            type: 'person',
            preferredName,
            legalName,
            gender,
            bornAt,
            diedAt,
            avatarImage,
            recps: this.whakapapaView.recps
          }
        }
      })

      if (res.errors) {
        console.error('failed to createProfile', res)
        return
      }
      return res.data.saveProfile // a profileId
    },
    async createChildLink (
      { child, parent, relationshipType, legallyAdopted },
      view
    ) {
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
        id: this.$route.params.id,
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
    async updateProfile (profileChanges) {
      const profileId = this.selectedProfile.id
      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: profileId,
            ...profileChanges
          }
        }
      })
      if (res.errors) {
        console.error('failed to update profile', res)
        return
      }
      await this.loadDescendants(profileId)
    },
    async deleteProfile () {
      if (!this.canDelete) return
      const profileId = this.selectedProfile.id

      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
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
      await this.loadDescendants(this.whakapapaView.focus)
      // TODO - find a smaller subset to reload!
    },
    setSelectedProfile (profileId) {
      this.selectedProfile = this.profiles[profileId] // gets the value of the profile
      this.selectedProfile = tree.hydrate(this.selectedProfile, this.profiles) // gets its hydrated value
    }
  },
  components: {
    Tree,
    VueContext,
    NewNodeDialog,
    DeleteNodeDialog,
    ViewEditNodeDialog
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.body-width {
  max-width: 900px;
}
</style>
