<template>
  <div id="whakapapa-show">
    <v-container class="white px-0 py-0 mx-auto">
      <v-row v-if="!mobile" class="header">
        <WhakapapaViewCard :view="whakapapaView" :shadow="false">
          <v-row class="lock-container">
            <v-col class="lock-icon">
              <v-icon small color="#555">mdi-lock</v-icon>
              <span id="lock-icon-margin"
                >Private record - Only visible by you</span
              >
            </v-col>
          </v-row>
        </WhakapapaViewCard>
      </v-row>
      <v-banner light v-if="mobile" single-line>
        <v-avatar size="35">
          <v-img
            v-if="whakapapaView.image && whakapapaView.image.uri"
            :src="whakapapaView.image.uri"
            :alt="alt"
          />
          <v-img v-else :src="getImage()" />
        </v-avatar>
        <span>
          {{ whakapapaView.name }}
        </span>
        <v-btn text color="primary" @click="toggleInformation()"
          >More info</v-btn
        >
      </v-banner>

      <v-row v-if="!mobile" class="feedback">
        <v-col>
          <FeedbackButton />
        </v-col>
      </v-row>

      <v-row>
        <Tree
          :view="whakapapaView"
          :nestedWhakapapa="nestedWhakapapa"
          :relationshipLinks="relationshipLinks"
          @load-descendants="loadDescendants($event)"
          @collapse-node="collapseNode($event)"
          @open-context-menu="openContextMenu($event)"
        />
      </v-row>
    </v-container>

    <vue-context ref="menu">
      <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a href="#" @click.prevent="option.action">{{ option.title }}</a>
      </li>
      <li v-if="canDelete(selectedProfile)">
        <a href="#" @click.prevent="toggleDelete">Delete Person</a>
      </li>
    </vue-context>

    <ViewEditNodeDialog
      v-if="dialog.view"
      :show="dialog.view"
      :profile="selectedProfile"
      :deleteable="canDelete(selectedProfile)"
      :warnAboutChildren="
        selectedProfile && selectedProfile.id !== whakapapaView.focus
      "
      @close="toggleView()"
      @new="toggleNewPerson($event)"
      @submit="updateProfile($event)"
      @delete="deleteProfile()"
      @open-profile="setSelectedProfile($event)"
    />
    <NewNodeDialog
      v-if="dialog.new"
      :show="dialog.new"
      :title="`Add ${dialog.type} to ${selectedProfile.preferredName || '___'}`"
      @close="toggleNew"
      @submit="addPerson($event)"
    />
    <DeleteNodeDialog
      v-if="dialog.delete"
      :show="dialog.delete"
      :profile="selectedProfile"
      :warnAboutChildren="
        selectedProfile && selectedProfile.id !== whakapapaView.focus
      "
      @close="toggleDelete"
      @submit="deleteProfile"
    />
    <WhakapapaViewDialog
      :show="dialog.information"
      @close="toggleInformation()"
      :view="whakapapaView"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { VueContext } from 'vue-context'

import WhakapapaViewCard from '@/components/whakapapa-view/WhakapapaViewCard.vue'
import Tree from '@/components/Tree.vue'
import FeedbackButton from '@/components/FeedbackButton.vue'

import ViewEditNodeDialog from '@/components/dialog/ViewEditNodeDialog.vue'
import NewNodeDialog from '@/components/dialog/NewNodeDialog.vue'
import DeleteNodeDialog from '@/components/dialog/DeleteNodeDialog.vue'
import WhakapapaViewDialog from '@/components/dialog/WhakapapaViewDialog.vue'

import tree from '@/lib/tree-helpers'
import findSuccessor from '@/lib/find-successor'
import avatarHelper from '@/lib/avatar-helpers.js'

const saveWhakapapaLinkMutation = input => ({
  mutation: gql`
    mutation($input: WhakapapaLinkInput!) {
      saveWhakapapaLink(input: $input)
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
  name: 'WhakapapaShow',
  data () {
    return {
      whakapapaView: {
        name: 'Loading',
        description: '',
        focus: '',
        // mode: 'descendants',
        recps: null,
        image: { uri: '' }
      },
      // the record which defines the starting point for a tree (the 'focus')

      whoami: {
        profile: { id: '' }
      },
      // my profile id, to ensure we don't delete our own profile

      profiles: {},
      // a dictionary which maps profileIds > profiles
      // this is a store for lookups, and from which we build up nestedWhakapapa
      relationshipLinks: [],

      recordQueue: [],
      processingQueue: false,

      selectedProfile: null,
      dialog: {
        new: false,
        view: false,
        delete: false,
        type: 'child',
        information: false
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
              image {
                uri
              }
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
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
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
            { partners: [] }, // NOTE - ensures all nodes have "partners" field
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
        // get their ids
        var link = {
          relationshipId: child.relationshipId,
          relationshipType: child.relationshipType,
          parent: record.id,
          child: child.profile.id
        }
        this.relationshipLinks[record.id + '-' + child.profile.id] = link // puts a link into links which can be referenced using parentId-childId
        return this.loadDescendants(child.profile.id)
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
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              altNames
              avatarImage {
                uri
              }
              children {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  altNames
                  avatarImage {
                    uri
                  }
                }
                relationshipId
                relationshipType
              }

              parents {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  altNames
                  avatarImage {
                    uri
                  }
                }
                relationshipId
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
    canDelete (profile) {
      if (!profile) return false

      // not allowed to delete own profile
      if (profile.id === this.whoami.profile.id) return false

      // if deleting the focus (top ancestor)
      if (profile.id === this.whakapapaView.focus) {
        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(profile))
      }

      return true
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
    toggleInformation () {
      this.dialog.information = !this.dialog.information
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
            await this.createChildLink({ child, parent, ...relationshipAttrs })

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
          // TODO - rm (not sure this does anything)
        }
      } catch (err) {
        throw err
      }
    },
    async createProfile ({
      preferredName,
      legalName,
      gender,
      bornAt,
      diedAt,
      birthOrder,
      avatarImage,
      altNames,
      description
    }) {
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
            birthOrder,
            avatarImage,
            altNames,
            description,
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
        const res = await this.$apollo.mutate(saveWhakapapaLinkMutation(input))
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
      this.setSelectedProfile(profileId)
    },
    async deleteProfile () {
      if (!this.canDelete(this.selectedProfile)) return

      if (this.selectedProfile.id === this.whakapapaView.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.updateFocus(successor.id)
      }

      const profileResult = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.selectedProfile.id,
            tombstone: { date: new Date() }
          }
        }
      })

      if (profileResult.errors) {
        console.error('failed to delete profile', profileResult)
        return
      }

      this.profiles = {}
      await this.loadDescendants(this.whakapapaView.focus)
      // TODO - find a smaller subset to reload!
    },
    setSelectedProfile (profileId) {
      this.selectedProfile = tree.hydrate(
        this.profiles[profileId],
        this.profiles
      )
    },
    getImage () {
      return avatarHelper.defaultImage(this.bornAt, this.gender)
    }
  },
  components: {
    WhakapapaViewCard,
    FeedbackButton,
    Tree,
    VueContext,
    NewNodeDialog,
    DeleteNodeDialog,
    ViewEditNodeDialog,
    WhakapapaViewDialog
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '~vue-context/dist/css/vue-context.css';

#whakapapa-show {
  & > .container {
    position: relative;
    & > .header {
      position: absolute;
      top: 20px;
      left: 30px;
      // left: 30px;
      right: 160px;

      .col {
        padding-top: 0;
        padding-bottom: 0;
      }
    }

    & > .feedback {
      position: absolute;
      top: 20px;
      right: 30px;

      .col {
        padding-top: 0;
        padding-bottom: 0;
      }
    }
  }
}
h1 {
  color: black;
}
.description {
  color: #555;
}
.fixed {
  position: fixed;
}
.lock-container {
  .lock-icon {
    display: flex;
    align-items: center;
    font-size: 0.8em;
    color: #555;
  }
  #lock-icon-margin {
    margin-left: 10px;
  }
}

svg {
  max-height: calc(100vh - 64px);
}
</style>
