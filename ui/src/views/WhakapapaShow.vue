<template>
  <div id="whakapapa-show">
    <v-container fluid class="pa-0" :style="[ mobile ? 'width:100vw' : 'width:95vw; margin-top:64px;' ]">

      <!-- Desktop Header -->
      <!-- Whakapapa Title Card -->
      <v-row v-if="!mobile" class="header">
        <!-- Whakapapa"SHOW"ViewCard -->
        <WhakapapaShowViewCard :view="whakapapaView" :shadow="false">
          <template v-slot:edit v-if="whakapapaView && whakapapaView.canEdit">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click.stop="dialog.active = 'whakapapa-edit'"
                  icon
                  class="pa-0 px-3"
                >
                  <v-icon small class="blue--text">mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit whakapapa description</span>
            </v-tooltip>
          </template>
        </WhakapapaShowViewCard>
      </v-row>

      <!-- Mobile Header -->
      <WhakapapaBanner
        v-if="mobile"
        :view="whakapapaView"
        @edit="updateDialog('whakapapa-edit', null)"
        @more-info="updateDialog('whakapapa-view', null)"
      />

      <v-row v-if="!mobile" class="select">
        <div class="icon-search">
          <SearchBar
            v-if="!searchNodeId"
            :searchFilter="false"
            :searchNodeId.sync="searchNodeId"
            :searchNodeName.sync="searchNodeName"
            @close="clickedOffSearch()"
            @searchNode="setSearchNode($event)"
          />
          <SearchBarNode
            v-else
            :searchNodeId.sync="searchNodeId"
            :searchNodeName="searchNodeName"
          />
        </div>
        <div class="icon-button">
          <SearchFilterButton :searchFilter.sync="searchFilter"/>
        </div>
        <div class="icon-button" v-if="isKaitiaki">
          <TableButton :table="whakapapaView.table" @table="toggleTable()" />
        </div>
        <div v-if="whakapapaView.table" class="icon-button">
          <ExportButton @export="toggleDownload()" />
        </div>
        <div class="icon-button">
          <InfoButton v-if="whakapapaView.tree" @click="updateDialog('whakapapa-helper', null)" />
          <InfoButton v-else @click="updateDialog('whakapapa-table-helper', null)" />
        </div>
        <div class="icon-button">
          <HelpButton />
        </div>
      </v-row>
      <!-- speed dial menu for mobile -->
      <v-card v-if="mobile" id="speeddial">
        <v-speed-dial
          v-model="fab"
          right
          direction="bottom"
          transition="slide-y-transition"
          fixed
        >
          <template v-slot:activator>
            <v-btn
              v-model="fab"
              color="black"
              dark
              fab
              x-small
            >
              <v-icon v-if="fab">mdi-close</v-icon>
              <v-icon v-else>mdi-hexagon-multiple</v-icon>
            </v-btn>
          </template>
          <div v-if="search" class="icon-search mobile-searchBar" @click.stop>
            <SearchBar
              v-if="!searchNodeId"
              :searchNodeId.sync="searchNodeId"
              :searchNodeName.sync="searchNodeName"
              @searchNode="setSearchNode($event)"
              @close="clickedOffSearch()"
            />
            <SearchBarNode
              v-else
              :searchNodeId.sync="searchNodeId"
              :searchNodeName="searchNodeName"
            />
          </div>
          <div v-else  class="icon-button">
            <SearchButton  @click.stop :search.sync="search" />
          </div>
          <div v-if="whakapapaView.table" class="icon-button">
            <SearchFilterButton :searchFilter.sync="searchFilter"/>
          </div>
          <div class="icon-button">
            <TableButton :table="whakapapaView.table" @table="toggleTable()" />
          </div>
          <div class="icon-button">
            <InfoButton v-if="whakapapaView.tree" @click="updateDialog('whakapapa-helper', null)" />
            <InfoButton v-else @click="updateDialog('whakapapa-table-helper', null)" />
          </div>
          <div class="icon-button">
            <HelpButton />
          </div>
        </v-speed-dial>
      </v-card>
      <Tree
        v-if="whakapapaView.tree"

        :class="mobile? 'mobile-tree':'tree'"

        :searchNodeId="searchNodeId"
        :getRelatives="getRelatives"
        :showAvatars="showAvatars"

        @change-focus="changeFocus($event)"
      />
      <div v-if="whakapapaView.table" :class="mobile ? 'mobile-table' : 'whakapapa-table'">
        <Table
          ref="table"

          :download.sync="download"
          :searchNodeId="searchNodeId"
          :searchNodeEvent="searchNodeEvent"
        />
      </div>
    </v-container>

    <NodeMenu :view="whakapapaView" :currentFocus="currentFocus" @open="updateDialog($event.dialog, $event.type)"/>

    <FilterMenu
      :show="searchFilter"
      :isTable="whakapapaView.table"
      @close="clickedOffSearchFilter()"
      @toggleAvatars="toggleShowAvatars()"
    />

    <DialogHandler
      :dialog.sync="dialog.active"
      :type.sync="dialog.type"
      :view="whakapapaView"
      :loadKnownFamily="loadKnownFamily"
      :getRelatives="getRelatives"
      @updateFocus="updateFocus($event)"
      :setSelectedProfile="setSelectedProfile"
      @change-focus="changeFocus($event)"
      @newAncestor="setFocus($event)"
      :focus="focus"
      @update-whakapapa="processSaveWhakapapa"
      @delete-whakapapa="deleteWhakapapa"
      @setFocus="setFocus($event)"
      @toggleFilterMenu="clickedOffSearchFilter()"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import FilterMenu from '@/components/dialog/whakapapa/FilterMenu.vue'

import WhakapapaShowViewCard from '@/components/whakapapa/WhakapapaShowViewCard.vue'
import WhakapapaBanner from '@/components/whakapapa/WhakapapaBanner.vue'

import Tree from '@/components/tree/Tree.vue'
import Table from '@/components/table/Table.vue'
import HelpButton from '@/components/button/HelpButton.vue'
import TableButton from '@/components/button/TableButton.vue'
import InfoButton from '@/components/button/InfoButton.vue'
import ExportButton from '@/components/button/ExportButton.vue'

import SearchBar from '@/components/button/SearchBar.vue'
import SearchBarNode from '@/components/button/SearchBarNode.vue'
import SearchButton from '@/components/button/SearchButton.vue'
import SearchFilterButton from '@/components/button/SearchFilterButton.vue'
import DialogHandler from '@/components/dialog/DialogHandler.vue'
import NodeMenu from '@/components/menu/NodeMenu.vue'

import tree from '@/lib/tree-helpers'
import avatarHelper from '@/lib/avatar-helpers.js'
import { getRelatives } from '@/lib/person-helpers.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'
import { ACCESS_ALL_MEMBERS, ACCESS_PRIVATE, ACCESS_KAITIAKI } from '@/lib/constants'

export default {
  name: 'WhakapapaShow',
  components: {
    WhakapapaShowViewCard,
    TableButton,
    InfoButton,
    SearchBar,
    SearchBarNode,
    SearchButton,
    SearchFilterButton,
    HelpButton,
    Table,
    Tree,
    DialogHandler,
    WhakapapaBanner,
    NodeMenu,
    ExportButton,
    FilterMenu
  },
  mixins: [
    mapProfileMixins({
      mapMethods: ['getWhakapapaLink']
    })
  ],
  data () {
    return {
      accessOptions: [],
      fab: false,
      overflow: 'false',
      pan: 0,
      search: false,
      searchFilter: false,
      searchNodeId: '',
      searchNodeEvent: null,
      showWhakapapaHelper: false,
      focus: null,
      // the record which defines the starting point for a tree (the 'focus')

      dialog: {
        active: null,
        type: null
      },

      download: false,
      searchNodeName: '',
      showAvatars: true
    }
  },
  async mounted () {
    window.scrollTo(0, 0)
    await this.reload()
  },

  computed: {
    ...mapGetters(['whoami', 'isKaitiaki', 'loadingState']),
    ...mapGetters('person', ['selectedProfile']),
    ...mapGetters('tribe', ['tribes']),
    ...mapGetters('whakapapa', ['whakapapaView', 'nestedWhakapapa']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    currentFocus: {
      get () {
        return this.focus || (this.whakapapaView && this.whakapapaView.focus)
      },
      set (newValue) {
        this.focus = newValue
      }
    },
    sortFields () {
      return [
        {
          name: 'Full Name',
          value: 'legalName'
        },
        {
          name: 'Preferred Name',
          value: 'preferredName'
        },
        {
          name: 'Age',
          value: 'age'
        },
        {
          name: 'Profession',
          value: 'profession'
        },
        {
          name: 'Country',
          value: 'country'
        }
      ]
    }
  },
  watch: {
    currentFocus: {
      immediate: true,
      async handler (newFocus) {
        if (!newFocus) return

        this.loadDescendants(newFocus)
      }
    },
    async whakapapaView (view) {
      if (view && view.recps) {
        // get the tribe this record is encrypted to

        const groupId = view.recps[0]

        // if its your personal group
        if (this.whoami.personal.groupId === groupId) {
          this.accessOptions = [{
            type: ACCESS_PRIVATE,
            groupId: this.whoami.personal.groupId,
            profileId: this.whoami.personal.profile.id
          }]
        } else {
          const tribe = await this.getTribe(view.recps[0])
          const parentGroup = this.tribes.find(otherTribe => otherTribe.admin && otherTribe.admin.id === groupId)

          if (parentGroup) {
            const profileId = (parentGroup.private[0] || parentGroup.public[0]).id

            this.accessOptions = [{
              type: ACCESS_KAITIAKI,
              groupId,
              profileId // community profileId
            }]
          } else {
            const profileId = (tribe.private[0] || tribe.public[0]).id
            this.accessOptions = [{
              type: ACCESS_ALL_MEMBERS,
              groupId,
              profileId // community profileId
            }]
          }
        }

        this.setCurrentAccess(this.accessOptions[0])
      }
    }
  },

  methods: {
    ...mapActions('person', ['updateSelectedProfile']),
    ...mapActions(['setLoading', 'setCurrentAccess']),
    ...mapActions('table', ['resetTableFilters']),
    ...mapActions('tribe', ['getTribe']),
    ...mapActions('whakapapa', ['loadWhakapapaView', 'resetWhakapapaView', 'saveWhakapapaView', 'loadDescendants', 'setExtendedFamily', 'toggleViewMode']),
    async reload () {
      await this.loadWhakapapaView(this.$route.params.whakapapaId)
    },
    toggleShowAvatars () {
      this.showAvatars = !this.showAvatars
    },
    tableOverflow (width) {
      var show = width > screen.width
      this.overflow = show
    },
    clickedOffSearch () {
      this.search = !this.search
    },
    clickedOffSearchFilter () {
      this.searchFilter = !this.searchFilter
    },
    // isVisibleProfile (descendant) {
    //   return this.whakapapaView.ignoredProfiles.indexOf(descendant.id) === -1
    // },
    openPartnerSideNode (dialog, type, profile) {
      this.setSelectedProfile(profile)
      if (this.dialog.active === 'view-edit-node') {
        this.updateDialog(null, null)
      }
      this.updateDialog(dialog, type)
    },
    updateDialog (dialog, type) {
      this.dialog.type = type
      this.dialog.active = dialog
    },
    // Used when ignoring/deleting top ancestor on a partner line
    // AND when adding a partner ancestor update the tree to load
    setFocus (profileId) {
      this.currentFocus = profileId
    },
    // Used when adding top ancestor on a partner line & swapping between partner lines
    async changeFocus (profileId) {
      this.updateDialog(null)
      const newFocus = await this.getWhakapapaHead(profileId, 'newAmountParents')

      this.setSelectedProfile(profileId)
      this.setFocus(newFocus)
    },
    async getWhakapapaHead (profileId, type = 'temp') {
      if (this.whakapapaView.focus === profileId) return profileId

      const record = await this.getRelatives(profileId)
      if (
        !record || !record.parents || !record.parents.length ||
        this.whakapapaView.ignoredProfiles.includes(record.parents[0].id)
      ) return profileId

      return this.getWhakapapaHead(record.parents[0].id, type)
    },
    /*
      makes changes of a person to all their decendants
      without making calls to the db
    */
    async loadKnownFamily (loadProfile, person) {
      // TODO move this into vuex
      const { children, parents, partners, siblings, parent, relationshipType, legallyAdopted } = person
      var profile = {}

      if (loadProfile) {
        profile = await this.getRelatives(person.id)
      } else {
        profile = person
      }

      // populate it with what we do know about family members
      profile = Object.assign(profile, {
        parent,
        relationshipType,
        legallyAdopted,
        children: children || [],
        parents: parents || [],
        siblings: siblings || [],
        partners: partners || []
      })

      if (!profile.children || profile.children.length === 0) return profile

      // change my profile in all of my children
      profile.children = profile.children.map(child => {
        if (!child.parents) return child
        child.parents = child.parents.map(parent => {
          if (parent.id === person.id) return profile
          return parent
        })

        return child
      })

      return profile
    },

    async getRelatives (id) {
      const result = await getRelatives(id, this.$apollo)
      if (!result) return

      return result
    },
    openTableContextMenu (event) {
      this.setSelectedProfile(event.profile)
      if (this.dialog.active === 'view-edit-node') {
        this.updateDialog(null, null)
      }
      this.$refs.menu.open(event.$event)
    },
    toggleDownload () {
      this.download = !this.download
    },
    toggleTable () {
      this.toggleViewMode()
    },
    toggleWhakapapaHelper () {
      this.showWhakapapaHelper = !this.showWhakapapaHelper
    },
    async updateFocus (focus) {
      await this.processSaveWhakapapa({ focus })
    },
    async setSelectedProfile (profile) {
      if (profile === null) {
        this.updateSelectedProfile({})
        return
      }

      if (typeof profile === 'object') {
        var loadedProfile = await this.loadKnownFamily(true, profile)
        this.updateSelectedProfile(loadedProfile)
      } else if (typeof profile === 'string') {
        // need to find the profile in this whakapapa
        var profileInNestedWhakapapa = tree.find(this.nestedWhakapapa, profile)
        if (profileInNestedWhakapapa) this.updateSelectedProfile(profileInNestedWhakapapa)
        // NOTE - tree.find no longer needed when we change to updateSelectedProfileById
        // TODO - delete tree-helpers
      } else {
        this.updateSelectedProfile({})
      }
    },
    async processSaveWhakapapa (input) {
      input = {
        id: this.whakapapaView.id,
        ...input
      }

      await this.saveWhakapapaView(input)
    },
    async deleteWhakapapa () {
      var input = {
        tombstone: { date: new Date() }
      }

      await this.processSaveWhakapapa(input)

      // check the group we are going to is an admin one
      const parentGroup = this.tribes.find(tribe => tribe.admin && tribe.admin.id === this.$route.params.tribeId)
      var type = this.$route.name.split('/whakapapa')[0]

      if (parentGroup) {
        // navigate to the parent group instead if we found this group has one
        this.$router.push({ name: type + '/whakapapa', params: { tribeId: parentGroup.id, profileId: this.$route.params.profileId } }).catch(() => {})
      } else {
        this.$router.push({ name: type + '/whakapapa' }).catch(() => {})
      }
    },
    getImage () {
      return avatarHelper.defaultImage(this.aliveInterval, this.gender)
    },
    setSearchNode (event) {
      this.searchNodeEvent = event
    }
  },
  destroyed () {
    this.resetWhakapapaView()
    // TODO teach this to stop the recurssive lookup
  }
}

</script>
<style>
.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
  transform: rotate(0);
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~vue-context/dist/css/vue-context.css";

#whakapapa-show {
  &>.container {
    position: relative;
    max-height:98vh;
    &>.header {
      position: absolute;
      top: 70px;
      left: 50px;
      /* right: 160px; */
      width: 40%;
      .col {
          padding-top: 0;
          padding-bottom: 0;
      }
    }
    &>.select {
      position: fixed;
      top: 80px;
      right: 110px;
      .col {
          padding-top: 0;
          padding-bottom: 0;
      }
    }
    &>.navigate {
      position: fixed;
      top: 130px;
      right: 110px;
    }
    &>.navigateMobile {
      position: fixed;
      top: 130px;
      right: 50px;
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

.icon-button {
    padding: 0px;
    width: 50px;
    display: flex;
    justify-content: flex-end;
}

.icon-search {
    width: 300px;
    display: flex;
    justify-items: flex-end;
}

.contextMenuIcon {
    width: 20px;
    height: 20px;
    color: black;
}

.tree {
  max-height: calc(100vh)
}

.mobile-tree {
  position:absolute;
  height: calc(100vh - 43px);
  margin-top: -85px;
}

#speeddial {
  top:-45px;
}

.button-row {
  left: 20%;
  position: fixed;
}

.mobile-searchBar {
 padding-top: 10px;
 margin-right: 255px;
}

.button-group {
  position: fixed;
  top: 80px;
  right: 50px;
}

</style>
