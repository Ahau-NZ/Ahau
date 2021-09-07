<template>
  <div id="whakapapa-show">
    <v-container fluid class="pa-0" :style="[ mobile ? 'width:100vw' : 'width:95vw; margin-top:64px;' ]">

      <!-- Desktop Header -->
      <!-- Whakapapa Title Card -->
      <v-row v-if="!mobile" class="header">
        <!-- Whakapapa"SHOW"ViewCard -->
        <WhakapapaShowViewCard :view="whakapapaView" :access="access" :shadow="false">
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
            :nestedWhakapapa="nestedWhakapapa"
            :searchNodeId.sync="searchNodeId"
            :searchFilter="false"
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
        <div v-if="whakapapa.table" class="icon-button">
          <SearchFilterButton :searchFilter.sync="searchFilter"/>
        </div>
        <div class="icon-button" v-if="isKaitiaki">
          <TableButton :table="whakapapa.table" @table="toggleTable()" />
        </div>
        <div v-if="whakapapa.table" class="icon-button">
          <ExportButton @export="toggleDownload()" />
        </div>
        <div class="icon-button">
          <HelpButton v-if="whakapapa.tree" @click="updateDialog('whakapapa-helper', null)" />
          <HelpButton v-else @click="updateDialog('whakapapa-table-helper', null)" />
        </div>
        <div class="icon-button">
          <FeedbackButton />
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
              :nestedWhakapapa="nestedWhakapapa"
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
          <div v-if="whakapapa.table" class="icon-button">
            <SearchFilterButton :searchFilter.sync="searchFilter"/>
          </div>
          <div class="icon-button">
            <TableButton :table="whakapapa.table" @table="toggleTable()" />
          </div>
          <div class="icon-button">
            <HelpButton v-if="whakapapa.tree" @click="updateDialog('whakapapa-helper', null)" />
            <HelpButton v-else @click="updateDialog('whakapapa-table-helper', null)" />
          </div>
          <div class="icon-button">
            <FeedbackButton />
          </div>
        </v-speed-dial>
      </v-card>
      <Tree
        :class="mobile? 'mobile-tree':'tree'"
        v-if="whakapapa.tree"
        :getRelatives="getRelatives"
        @load-descendants="loadDescendants($event)"
        @change-focus="changeFocus($event)"
        @loading='load($event)'
        :view="whakapapaView"
        :focus="focus"
        :searchNodeId="searchNodeId"
        :openMenu="openContextMenu"
      />
      <div v-if="whakapapa.table" :class="mobile ? 'mobile-table' : 'whakapapa-table'">
        <Table
          ref="table"
          :filter="filter"
          :flatten="flatten"
          :download.sync="download"
          :view="whakapapaView"
          :nestedWhakapapa="nestedWhakapapa"
          @load-descendants="loadDescendants($event)"
          @open-context-menu="openTableContextMenu($event)"
          @open="openPartnerSideNode($event.dialog, $event.type, $event.profile)"
          :searchNodeId="searchNodeId"
          :searchNodeEvent="searchNodeEvent"
        />
      </div>
    </v-container>

    <NodeMenu ref="menu" :view="whakapapaView" :currentFocus="currentFocus" @open="updateDialog($event.dialog, $event.type)"/>

    <FilterMenu
      v-if="whakapapa.table"
      :show="searchFilter"
      :flatten="flatten"
      @close="clickedOffSearchFilter()"
      @descendants="toggleFilter()"
      @whakapapa="toggleFlatten()"
    />

    <DialogHandler
      :dialog.sync="dialog.active"
      :type.sync="dialog.type"
      :view="whakapapaView"
      :loadDescendants="loadDescendants"
      :loadKnownFamily="loadKnownFamily"
      :getRelatives="getRelatives"
      @updateFocus="updateFocus($event)"
      :setSelectedProfile="setSelectedProfile"
      @change-focus="changeFocus($event)"
      @newAncestor="setFocus($event)"
      :focus="focus"
      @update-whakapapa="saveWhakapapa($event)"
      @delete-whakapapa="deleteWhakapapa"
      @setFocus="setFocus($event)"
      @toggleFilterMenu="clickedOffSearchFilter()"
    />
  </div>
</template>

<script>
import uniqby from 'lodash.uniqby'
import flatten from 'lodash.flatten'

import FilterMenu from '@/components/dialog/whakapapa/FilterMenu.vue'

import WhakapapaShowViewCard from '@/components/whakapapa/WhakapapaShowViewCard.vue'
import WhakapapaBanner from '@/components/whakapapa/WhakapapaBanner.vue'

import Tree from '@/components/tree/Tree.vue'
import Table from '@/components/table/Table.vue'
import FeedbackButton from '@/components/button/FeedbackButton.vue'
import TableButton from '@/components/button/TableButton.vue'
import HelpButton from '@/components/button/HelpButton.vue'
import ExportButton from '@/components/button/ExportButton.vue'

import SearchBar from '@/components/button/SearchBar.vue'
import SearchBarNode from '@/components/button/SearchBarNode.vue'
import SearchButton from '@/components/button/SearchButton.vue'

import SearchFilterButton from '@/components/button/SearchFilterButton.vue'

import tree from '@/lib/tree-helpers'
import avatarHelper from '@/lib/avatar-helpers.js'
import { getRelatives } from '@/lib/person-helpers.js'
import { saveWhakapapaView } from '@/lib/whakapapa-helpers.js'
import { getTribalProfile } from '@/lib/community-helpers'

import mapProfileMixins from '@/mixins/profile-mixins.js'

import DialogHandler from '@/components/dialog/DialogHandler.vue'

import NodeMenu from '@/components/menu/NodeMenu.vue'

import {
  mapGetters,
  mapActions,
  mapMutations,
  createNamespacedHelpers
} from 'vuex'
const {
  mapActions: mapWhakapapaActions,
  mapGetters: mapWhakapapaGetters,
  mapMutations: mapWhakapapaMutations
} = createNamespacedHelpers('whakapapa')

const { mapGetters: mapPersonGetters, mapMutations: mapPersonMutations } = createNamespacedHelpers('person')

const {
  mapActions: mapTableActions
} = createNamespacedHelpers('table')

export default {
  name: 'WhakapapaShow',
  components: {
    WhakapapaShowViewCard,
    TableButton,
    HelpButton,
    SearchBar,
    SearchBarNode,
    SearchButton,
    SearchFilterButton,
    FeedbackButton,
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
      mapMethods: ['getTribe', 'getWhakapapaLink']
    })
  ],
  data () {
    return {
      access: null,
      fab: false,
      overflow: 'false',
      pan: 0,
      search: false,
      searchFilter: false,
      searchNodeId: '',
      searchNodeEvent: null,
      showWhakapapaHelper: false,
      whakapapaView: {
        name: 'Loading',
        description: '',
        focus: '',
        recps: null,
        image: { uri: '' },
        ignoredProfiles: []
      },
      focus: null,
      // the record which defines the starting point for a tree (the 'focus')

      dialog: {
        active: null,
        type: null
      },
      filter: false,
      flatten: true,
      download: false,
      whakapapa: {
        tree: true,
        table: false
      },
      searchNodeName: ''
    }
  },
  async mounted () {
    this.setLoading(true)
    window.scrollTo(0, 0)
    await this.reload()
  },
  computed: {
    ...mapGetters(['whoami', 'isKaitiaki']),
    ...mapPersonGetters(['selectedProfile']),
    ...mapWhakapapaGetters(['nestedWhakapapa']),
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
    currentFocus: async function (newFocus) {
      this.setLoading(true)
      if (newFocus) {
        const nestedWhakapapa = await this.loadDescendants(newFocus)
        this.setNestedWhakapapa(nestedWhakapapa)
      }
      this.setLoading(false)
    },
    async whakapapaView (whakapapa) {
      if (whakapapa.recps) {
        const tribe = await this.getTribe(whakapapa.recps[0])
        this.access = getTribalProfile(tribe, this.whoami)
        this.setCurrentAccess(this.access)
      }
      this.setWhakapapa(whakapapa)
    }
  },

  methods: {
    ...mapMutations(['setCurrentAccess']),
    ...mapPersonMutations(['updateSelectedProfile']),
    ...mapActions(['setLoading']),
    ...mapWhakapapaMutations(['setNestedWhakapapa', 'setWhakapapa']),
    ...mapWhakapapaActions(['getWhakapapaView']),
    ...mapTableActions(['resetTableFilters']),
    async reload () {
      this.whakapapaView = await this.getWhakapapaView(this.$route.params.whakapapaId)
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
    isVisibleProfile (descendant) {
      if (this.whakapapaView.ignoredProfiles) { return this.whakapapaView.ignoredProfiles.indexOf(descendant.id) === -1 }
    },
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
    // Used when ignoring/deleteing top ancestor on a partner line
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

      // // change my profile in all of my children
      profile.children = await Promise.all(profile.children.map(async child => {
        if (!child.parents) return child
        child.parents = child.parents.map(parent => {
          if (parent.id === person.id) {
            return profile
          }
          return parent
        })

        return child
      }))

      return profile
    },

    async getRelatives (id) {
      const result = await getRelatives(id, this.$apollo)
      if (!result) return

      return result
    },

    async loadDescendants (profileId) {
      // get the persons profile + links
      var person = await this.getRelatives(profileId)

      // filter out ignored profiles
      person.children = person.children.filter(this.isVisibleProfile)
      person.parents = person.parents.filter(this.isVisibleProfile)
      person.partners = person.partners.filter(this.isVisibleProfile)

      // map all links
      person.children = await this.mapChildren(person)
      person.partners = [...person.partners, ...this.getOtherPartners(person)]

      // if this person is the selected one, then we make sure we keep that profile up to date
      if (this.selectedProfile && this.selectedProfile.id === person.id) this.updateSelectedProfile(person)
      return person
    },
    getOtherPartners (person) {
      // get all the other parents
      let formatted = flatten(person.children.map(d => d.parents))
        .filter((parent) => {
          return (
            (parent.id !== person.id) &&
            !person.partners.some(partner => partner.id === parent.id)
          )
        })

      formatted = uniqby(formatted, 'id')
        .map(partner => {
          return {
            ...partner, // their profile
            isNonPartner: true,
            children: this.getOtherParentChildren(person, partner)
          }
        })

      return formatted
    },
    getOtherParentChildren (mainParent, partner) {
      return mainParent.children.filter(child => child.parents.some(parent => parent.id === partner.id))
    },
    async mapChildren (person) {
      return Promise.all(person.children.map(async child => {
        var childProfile = await this.loadDescendants(child.id)

        // load the relationship between the two
        const { relationshipType, legallyAdoped } = await this.getWhakapapaLink(person.id, child.id)
        childProfile.relationshipType = relationshipType
        childProfile.legallyAdoped = legallyAdoped

        return childProfile
      }))
    },
    openContextMenu ({ event, profile }) {
      this.setSelectedProfile(profile)
      if (this.dialog.active === 'view-edit-node') {
        this.updateDialog(null, null)
      }
      this.$refs.menu.open(event)
    },
    openTableContextMenu (event) {
      this.setSelectedProfile(event.profile)
      if (this.dialog.active === 'view-edit-node') {
        this.updateDialog(null, null)
      }
      this.$refs.menu.open(event.$event)
    },
    toggleFilter () {
      this.filter = !this.filter
    },
    toggleFlatten () {
      this.filter = false
      this.flatten = !this.flatten
    },
    toggleDownload () {
      this.download = !this.download
    },
    toggleTable () {
      this.whakapapa.tree = !this.whakapapa.tree
      this.whakapapa.table = !this.whakapapa.table
    },
    toggleWhakapapaHelper () {
      this.showWhakapapaHelper = !this.showWhakapapaHelper
    },
    async updateFocus (focus) {
      await this.saveWhakapapa({ focus })
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
        var profileInNestedWhakapapa = await tree.find(this.nestedWhakapapa, profile)
        if (profileInNestedWhakapapa) this.updateSelectedProfile(profileInNestedWhakapapa)
      } else {
        this.updateSelectedProfile({})
      }
    },
    async saveWhakapapa (input) {
      input = {
        id: this.whakapapaView.id,
        ...input
      }

      try {
        const res = await this.$apollo.mutate(saveWhakapapaView(input))
        if (res.errors) {
          console.error('failed to save whakapapa', res.errors)
          return
        }
        // refresh the current whakapapa
        await this.reload()
        return res.data.saveWhakapapaView
      } catch (e) {
        console.error('something went wrong while trying to save the whakapapa', e)
      }
    },
    async deleteWhakapapa () {
      var input = {
        tombstone: { date: new Date() }
      }

      await this.saveWhakapapa(input)

      const [newPath] = this.$route.fullPath.split('whakapapa/')
      this.$router.push({ path: newPath + 'whakapapa' }).catch(() => {})
    },
    getImage () {
      return avatarHelper.defaultImage(this.aliveInterval, this.gender)
    },
    // sortTable (event) {
    //   this.$refs.sort.open(event)
    //   this.sortTableBool = !this.sortTableBool
    // },

    setSearchNode (event) {
      this.searchNodeEvent = event
    }
  },
  destroyed () {
    // reset whakapapa and relationships when leaving the tree
    this.setNestedWhakapapa([])
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
