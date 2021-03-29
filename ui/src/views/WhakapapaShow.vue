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
        <div v-if="search" class="icon-search">
          <SearchBar :nestedWhakapapa="nestedWhakapapa" :searchNodeId.sync="searchNodeId" :searchFilter="false" @close="clickedOffSearch()"  @searchNode="setSearchNode($event)"/>
        </div>
        <div v-else-if="searchFilterString === ''" class="icon-button">
          <SearchButton :search.sync="search" />
        </div>
        <div v-if="whakapapa.table" class="icon-button">
          <SearchFilterButton :searchFilter.sync="searchFilter"/>
        </div>
        <div v-if="whakapapa.table && flatten" class="icon-button">
          <SortButton @sort="sortTable($event)" />
        </div>
        <div v-if="whakapapa.table && flatten" class="icon-button">
          <FilterButton :filter="filter" @filter="toggleFilter()" />
        </div>
        <div v-if="whakapapa.table" class="icon-button">
          <FlattenButton @flatten="toggleFlatten()" />
        </div>
        <div class="icon-button" v-if="isKaitiaki">
          <TableButton @table="toggleTable()" />
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
      <v-card v-if="mobile" id="create">
        <v-speed-dial
          v-model="fab"
          top
          left
          direction="right"
          transition="slide-y-transition"
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
          <div v-if="search" class="icon-search ml-n12 pt-7" @click.stop>
            <SearchBar :nestedWhakapapa="nestedWhakapapa" :searchNodeId.sync="searchNodeId" @searchNode="setSearchNode($event)" @close="clickedOffSearch()"/>
          </div>
          <div v-else-if="searchFilterString === ''"  class="icon-button">
            <SearchButton  @click.stop :search.sync="search" />
          </div>
          <div v-if="whakapapa.table" class="icon-button">
            <SearchFilterButton :searchFilter.sync="searchFilter"/>
          </div>
          <div v-if="whakapapa.table && flatten" class="icon-button">
            <SortButton @sort="sortTable($event)" />
          </div>
          <div v-if="whakapapa.table && flatten" class="icon-button">
            <FilterButton :filter="filter" @filter="toggleFilter()" />
          </div>
          <div v-if="whakapapa.table" class="icon-button">
            <FlattenButton @flatten="toggleFlatten()" />
          </div>
          <!-- <div class="icon-button">
            <TableButton @table="toggleTable()" />
          </div> -->
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
      <div v-if="whakapapa.table" class="whakapapa-table">
        <Table
          ref="table"
          :filter="filter"
          :flatten="flatten"
          :view="whakapapaView"
          :nestedWhakapapa="nestedWhakapapa"
          @load-descendants="loadDescendants($event)"
          @open-context-menu="openContextMenu($event)"
          :searchNodeId="searchNodeId"
          :searchFilterString="searchFilterString"
          :sortValue="sortValue"
          :sortEvent="sortEvent"
          :searchNodeEvent="searchNodeEvent"
        />
      </div>
    </v-container>

    <NodeMenu ref="menu" :view="whakapapaView" @open="updateDialog($event.dialog, $event.type)"/>

    <VueContext ref="sort" class="px-0">
      <li v-for="(field, i) in sortFields" :key="`sort-field-${i}`">
        <a href="#" @click.prevent="setSortField(field.value, $event)" class="d-flex align-center px-4">
          <p class="ma-0 pl-3">{{ field.name }}</p>
        </a>
      </li>
    </VueContext>

    <DialogHandler
      :dialog.sync="dialog.active"
      :type.sync="dialog.type"
      :view="whakapapaView"
      :loadDescendants="loadDescendants"
      :loadKnownFamily="loadKnownFamily"
      :getRelatives="getRelatives"
      :searchFilterString.sync="searchFilterString"
      @updateFocus="updateFocus($event)"
      :setSelectedProfile="setSelectedProfile"
      @change-focus="changeFocus($event)"
      @newAncestor="setFocus($event)"
      :focus="focus"
      @update-whakapapa="saveWhakapapa($event)"
      @delete-whakapapa="deleteWhakapapa"
      @refreshWhakapapa="refreshWhakapapa"
      @setFocus="setFocus($event)"
      @toggleFilterMenu="clickedOffSearchFilter()"
    />
  </div>
</template>

<script>
import { VueContext } from 'vue-context'

import WhakapapaShowViewCard from '@/components/whakapapa/WhakapapaShowViewCard.vue'
import WhakapapaBanner from '@/components/whakapapa/WhakapapaBanner.vue'

import Tree from '@/components/tree/Tree.vue'
import Table from '@/components/table/Table.vue'
import FeedbackButton from '@/components/button/FeedbackButton.vue'
import TableButton from '@/components/button/TableButton.vue'
import HelpButton from '@/components/button/HelpButton.vue'
import FlattenButton from '@/components/button/FlattenButton.vue'
import FilterButton from '@/components/button/FilterButton.vue'
import SortButton from '@/components/button/SortButton.vue'

import SearchBar from '@/components/button/SearchBar.vue'
import SearchButton from '@/components/button/SearchButton.vue'

import SearchFilterButton from '@/components/button/SearchFilterButton.vue'

import tree from '@/lib/tree-helpers'
import avatarHelper from '@/lib/avatar-helpers.js'
import { getRelatives } from '@/lib/person-helpers.js'
import { getWhakapapaView, saveWhakapapaView } from '@/lib/whakapapa-helpers.js'
import { getTribalProfile } from '@/lib/community-helpers'

import mapProfileMixins from '@/mixins/profile-mixins.js'

import DialogHandler from '@/components/dialog/DialogHandler.vue'

import NodeMenu from '@/components/menu/NodeMenu.vue'

import { mapGetters, mapActions, mapMutations } from 'vuex'

import pileSort from 'pile-sort'

export default {
  name: 'WhakapapaShow',
  components: {
    WhakapapaShowViewCard,
    TableButton,
    HelpButton,
    FlattenButton,
    FilterButton,
    SortButton,
    SearchBar,
    SearchButton,
    SearchFilterButton,
    FeedbackButton,
    Table,
    Tree,
    VueContext,
    DialogHandler,
    WhakapapaBanner,
    NodeMenu
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
      searchFilterString: '',
      searchNodeId: '',
      searchNodeEvent: null,
      showWhakapapaHelper: false,
      whakapapaView: {
        name: 'Loading',
        description: '',
        focus: '',
        // mode: 'descendants',
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
      whakapapa: {
        tree: true,
        table: false
      },
      sortTableBool: false,
      sortValue: '',
      sortEvent: null
    }
  },
  apollo: {
    whakapapaView () {
      return getWhakapapaView(this.$route.params.whakapapaId)
    }
  },
  mounted () {
    window.scrollTo(0, 0)
  },
  computed: {
    ...mapGetters(['nestedWhakapapa', 'selectedProfile', 'whoami', 'loadingState']),
    isKaitiaki () {
      if (!this.whakapapaView.kaitiaki) return false
      return this.whoami.public.profile.id === this.whakapapaView.kaitiaki[0].id
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    currentFocus: {
      get () {
        return this.focus || this.whakapapaView.focus
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
      if (newFocus) {
        this.setLoading(true)

        const nestedWhakapapa = await this.loadDescendants(newFocus)
        this.setNestedWhakapapa(nestedWhakapapa)

        this.setLoading(false)
      }
    },
    async whakapapaView (whakapapa) {
      if (whakapapa.recps) {
        const tribe = await this.getTribe(whakapapa.recps[0])
        this.access = getTribalProfile(tribe, this.whoami)
        this.setCurrentAccess(this.access)
      }
      this.setWhakapapa(whakapapa)
    },
    searchFilter (newValue) {
      if (newValue === true) {
        this.updateDialog('table-filter-menu', null)
        this.flatten = true
      }
    }
  },

  methods: {
    ...mapMutations(['updateSelectedProfile', 'setCurrentAccess', 'setNestedWhakapapa', 'setWhakapapa']),
    ...mapActions(['setLoading']),
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
      const { children, parents, partners, siblings, relationship } = person
      var profile = {}

      if (loadProfile) {
        profile = await this.getRelatives(person.id)
      } else {
        profile = person
      }

      // populate it with what we do know about family members
      profile = Object.assign(profile, {
        children: children || [],
        parents: parents || [],
        siblings: siblings || [],
        partners: partners || [],
        relationship: relationship
      })

      if (!profile.relationship && profile.parents.length) {
        const whakapapaLink = await this.getWhakapapaLink(profile.parents[0].id, profile.id)

        profile = {
          ...profile,
          ...whakapapaLink
        }
      }

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

      if (result.id === this.currentFocus && result.parents.length) {
        // this looks like we are sometimes wiping parents? why?
        // if it wasn't for this piece of code we would not need to pass this function into Tree, ...
        result.parents = []
      }
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
      // person.children = this.sortChildrenByOrderOfBirth(person)
      person.children = await this.mapChildren(person)

      // person.partners = this.mapPartners(person)
      // person.children = this.sortChildrenByPartner(person)

      // if this person is the selected one, then we make sure we keep that profile up to date
      if (this.selectedProfile && this.selectedProfile.id === person.id) this.updateSelectedProfile(person)
      return person
    },
    sortChildrenByOrderOfBirth (person) {
      return person.children.sort((a, b) => {
        return a.profile.birthOrder - b.profile.birthOrder
      })
    },
    sortChildrenByPartner (person) {
      // sort the children by partner
      const filters = []

      if (person.children.length === 0 || person.partners.length === 0) return person.children

      person.partners.forEach(({ id }) => {
        filters.push((child) => child.parents.some(p => p.id === id))
      })

      if (filters.length > 0) {
        var piles = pileSort(
          person.children,
          filters
        )

        let arr = []

        piles.forEach(d => {
          arr = [...arr, ...d]
        })

        person.children = arr
      }

      return person.children
    },
    async mapChildren (person) {
      return Promise.all(person.children.map(async child => {
        var childProfile = await this.loadDescendants(child.id)
        // copy over the relationship attrs
        childProfile.relationshipType = child.relationshipType
        childProfile.legallyAdopted = child.legallyAdopted
        return childProfile
      }))
    },
    mapPartners (person) {
      person.partners.map(partner => {
        // map the partners children
        partner.children = partner.children.map(child => {
          // get the childs profile
          // can be in two formats profile {...} OR child { profile {...}}
          const profile = child.profile ? child.profile : child

          // check if the current child is a child of the person too and get their profile from there
          const profileInPerson = person.children.find(c => c.id === profile.id)

          if (profileInPerson) {
            // if we found them, map them to this profile
            return profileInPerson
          }

          // otherwise just map them to their profile
          // note: these are step children and their relationship is ignored here
          return profile
        })

        // map partners parents to their profiles
        partner.parents = partner.parents.map(p => p.profile)

        // add this person as a partner
        partner.partners = [person] // note: we dont really care about the partners other partners because we dont need to load them yet
        partner.siblings = [] // initialise their siblings (not needed yet

        // return the new profile for the partner
        return partner
      })

      return person.partners
    },
    openContextMenu ({ event, profile }) {
      this.setSelectedProfile(profile)
      this.$refs.menu.open(event)
    },
    toggleFilter () {
      this.filter = !this.filter
    },
    toggleFlatten () {
      this.filter = false
      this.flatten = !this.flatten
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
      // check the type of profile we received
      if (typeof profile === 'object') {
        profile = await this.loadKnownFamily(true, profile)
        if (profile.parents.length) {
          // find parent to get any changes to siblings
          var person = await tree.find(this.nestedWhakapapa, profile.parents[0].id)
          if (!person) {
            this.updateSelectedProfile(profile)
            return
          }
          var updatedProfile = tree.getSiblings(person, profile)
          this.updateSelectedProfile(updatedProfile)
        } else this.updateSelectedProfile(profile)
      } else if (typeof profile === 'string') {
        // need to find the profile in this whakapapa
        var profileFound = await tree.find(this.nestedWhakapapa, profile)
        if (!profileFound) {
          // lets load descendants of them instead
          let partner = await this.loadDescendants(profile)
          partner.isPartner = true
          console.warn('could potentially be loading a large amount of data')
          this.updateSelectedProfile(partner)
          return
        }
        if (profileFound.parents.length) {
          // find parent to get any changes to siblings
          var parent = await tree.find(this.nestedWhakapapa, profileFound.parents[0].id)
          // if parent not found is becuase that parent is not in this nestedWhakapapa
          if (!parent) {
            this.updateSelectedProfile(profileFound)
            return
          }
          var newUpdatedProfile = tree.getSiblings(parent, profileFound)
          this.updateSelectedProfile(newUpdatedProfile)
        } else this.updateSelectedProfile(profileFound)
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
        await this.refreshWhakapapa()
        return res.data.saveWhakapapaView
      } catch (e) {
        console.error('something went wrong while trying to save the whakapapa', e)
      }
    },
    async refreshWhakapapa () {
      await this.$apollo.queries.whakapapaView.refresh()
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
    sortTable (event) {
      this.$refs.sort.open(event)
      this.sortTableBool = !this.sortTableBool
    },
    setSortField (value, event) {
      this.sortValue = value
      this.sortEvent = event
    },
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
      width: 30%;
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
  margin-top: -68px;
}

#create .v-speed-dial {
  position: absolute;
}

#create .v-btn--floating {
  position: relative;
}

.whakapapa-table {
  overflow: auto;
  width: 100%;
  padding-top: 50px;
}

</style>
