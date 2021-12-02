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
        <div class="icon-button">
          <SearchFilterButton :searchFilter.sync="searchFilter"/>
        </div>
        <div class="icon-button" v-if="isKaitiaki">
          <TableButton :table="whakapapa.table" @table="toggleTable()" />
        </div>
        <div v-if="whakapapa.table" class="icon-button">
          <ExportButton @export="toggleDownload()" />
        </div>
        <div class="icon-button">
          <InfoButton v-if="whakapapa.tree" @click="updateDialog('whakapapa-helper', null)" />
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
            <InfoButton v-if="whakapapa.tree" @click="updateDialog('whakapapa-helper', null)" />
            <InfoButton v-else @click="updateDialog('whakapapa-table-helper', null)" />
          </div>
          <div class="icon-button">
            <HelpButton />
          </div>
        </v-speed-dial>
      </v-card>
      <Tree
        :class="mobile? 'mobile-tree':'tree'"
        v-if="whakapapa.tree"
        :openMenu="openContextMenu"
        :view="whakapapaView"
        :searchNodeId="searchNodeId"
        :getRelatives="getRelatives"
        :showAvatars="showAvatars"
        :showPartners="showPartners"
        @load-descendants="loadDescendants($event)"
        @change-focus="changeFocus($event)"
        @loading='load($event)'
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
      :show="searchFilter"
      :flatten="flatten"
      :isTable="whakapapa.table"
      @close="clickedOffSearchFilter()"
      @descendants="toggleFilter()"
      @whakapapa="toggleFlatten()"
      @toggleAvatars="toggleShowAvatars()"
      @togglePartners="toggleShowPartners()"
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
      @update-whakapapa="processSaveWhakapapa"
      @delete-whakapapa="deleteWhakapapa"
      @setFocus="setFocus($event)"
      @toggleFilterMenu="clickedOffSearchFilter()"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import uniqby from 'lodash.uniqby'
import flatten from 'lodash.flatten'
import isEmpty from 'lodash.isempty'

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
      filter: false,
      flatten: true,
      download: false,
      whakapapa: {
        tree: true,
        table: false
      },
      searchNodeName: '',
      nodeIds: [],
      showAvatars: true,
      showPartners: true
    }
  },
  async mounted () {
    this.setLoading(true)
    window.scrollTo(0, 0)
    await this.reload()
  },
  computed: {
    ...mapGetters(['whoami', 'isKaitiaki']),
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
    },
    recordCount () {
      return [...new Set(this.nodeIds)].length
    }
  },
  watch: {
    currentFocus: {
      immediate: true,
      handler: async function (newFocus) {
        if (!newFocus) return

        this.setLoading(true)
        const nestedWhakapapa = await this.loadDescendants(newFocus)
        this.setNestedWhakapapa(nestedWhakapapa)
        this.setLoading(false)
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
    },
    showPartners: async function () {
      this.setLoading(true)
      this.setNestedWhakapapa({})
      const nestedWhakapapa = await this.loadDescendants(this.currentFocus)
      this.setNestedWhakapapa(nestedWhakapapa)
      this.setLoading(false)
    }
  },

  methods: {
    ...mapMutations('person', ['updateSelectedProfile']),
    ...mapActions(['setLoading', 'setCurrentAccess']),
    ...mapActions('table', ['resetTableFilters']),
    ...mapActions('tribe', ['getTribe']),
    ...mapActions('whakapapa', ['loadWhakapapaView', 'setNestedWhakapapa', 'resetWhakapapaView', 'saveWhakapapaView']),
    async reload () {
      await this.loadWhakapapaView(this.$route.params.whakapapaId)
    },
    toggleShowAvatars () {
      this.showAvatars = !this.showAvatars
    },
    toggleShowPartners () {
      this.showPartners = !this.showPartners
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
      return this.whakapapaView.ignoredProfiles.indexOf(descendant.id) === -1
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

    async loadDescendants (profileId, seen = new Set([])) {
      // TODO if seen isn't provided, maybe try and build based on parents above in graph?
      seen.add(profileId)
      // get the persons profile + links

      this.nodeIds.push(profileId)

      var person = await this.getRelatives(profileId)

      // filter out ignored profiles
      if (this.whakapapaView.ignoredProfiles) {
        person.children = person.children.filter(this.isVisibleProfile)
        person.parents = person.parents.filter(this.isVisibleProfile)
        person.partners = person.partners.filter(this.isVisibleProfile)
      }

      person.children = this.removeDuplicateNodes(person.children, person.id)
      person.partners = this.removeDuplicateNodes(person.partners, person.id)

      // map all links
      person.children = await this.mapChildren(person, seen)

      if (this.showPartners) {
        let otherChildren = []
        let otherParents = []
        let partnersOtherChildren = []

        // get all step/whangai parents of the children
        if (person.children.length) otherParents = await this.getOtherParents(person, seen)

        otherParents = this.removeDuplicateNodes(otherParents, person.id)

        // add half borthers and sisters as children with property of isNonChild
        if (otherParents.length) {
          otherParents.forEach(parent => {
            parent.children.forEach(child => { if (child.isNonChild) otherChildren.push(child) })
          })
        }

        // get all other children from current partner
        if (person.partners.length) partnersOtherChildren = await this.getOtherChildren(person, seen)
        if (partnersOtherChildren.length) {
          let arr = flatten(partnersOtherChildren)
          arr.forEach(child => { if (child.isNonChild) otherChildren.push(child) })
        }

        // add all children's whakapapa to this view
        otherChildren = await this.mapChildren({ children: otherChildren }, seen)

        person.partners = uniqby([...person.partners, ...otherParents], 'id')
        person.children = uniqby([...person.children, ...otherChildren], 'id')
        // sort children by birth order
        if (person.children.length > 0) {
          person.children.sort((a, b) => {
            return a.birthOrder - b.birthOrder
          })
        }
      }

      // if this person is the selected one, then we make sure we keep that profile up to date
      if (this.selectedProfile && this.selectedProfile.id === person.id) this.updateSelectedProfile(person)
      return person
    },

    removeDuplicateNodes (nodes, personId) {
      return nodes.filter(node => {
        // check if this node is listed as having an important relationship
        const importantRelationship = this.whakapapaView.importantRelationships.find(dupe => dupe.profileId === node.id)

        if (!importantRelationship) return true // keep this profile as no rule was found

        // profile has an important relationship so we only show the link between them and the first profile listed as important
        // any other links wont be drawn
        return importantRelationship.primary.profileId === personId
      })
    },

    // get all step children from current partner
    async getOtherChildren (person) {
      return Promise.all(person.partners.map(async partner => {
        let children = await this.getFullChildProfiles(partner, person)
        // remove children that already the main parents child

        return children
          .filter(child => !child.parents.some(parent => parent.id === person.id))
      }))
    },

    // get all the parents of the connected children
    async getOtherParents (person, seen) {
      // we have a problem if there is a child who is also a whangai sibling

      let parents = person.children
        .reduce(
          (acc, child) => {
            const rule = this.whakapapaView.importantRelationships.find(rule => {
              return rule.profileId === child.id
            })

            const otherParents = child.parents
              // exclude self
              .filter(otherParent => otherParent.id !== person.id)

              // exclude existing partners
              .filter(otherParent => person.partners.every(partner => partner.id !== otherParent.id))

              /*
                NOTE
                there is an edge case where if a child is whangai'd to a grandparent,
                then we can enter into an infinite loop when trying to resolve "otherParents"
              */
              // filter out otherParents we have already seen to prevent infinite loops
              .filter(otherParent => !seen.has(otherParent.id))

              // exclude less importantRelationships
              .filter(otherParent => {
                if (!rule) return true

                return rule.primary.profileId === otherParent.id // keep?
              })

            return [...acc, ...otherParents]
          },
          []
        )

      parents = uniqby(parents, 'id')

      // get partners full profiles to find if they have any other children
      parents = await this.getFullPartnerProfiles(parents, person)

      return parents
    },

    // get partners full profiles to find if they have any other children
    async getFullPartnerProfiles (partners, person) {
      return Promise.all(partners.map(async partner => {
        partner = await this.getRelatives(partner.id)
        // get all the children profiles so we can see which ones aren't connected to this parent
        partner.children = await this.getFullChildProfiles(partner, person)
        partner.children = partner.children.filter(child => !isEmpty(child))
        return {
          ...partner,
          isNonPartner: true
        }
      }))
    },

    // get parents full child profiles to match with other parents
    async getFullChildProfiles (partner, person) {
      return Promise.all(
        partner.children.map(async child => {
          let fullChild = await this.getRelatives(child.id)
          if (!fullChild.parents.some(parent => parent.id === person.id)) {
            fullChild = {
              ...fullChild,
              isNonChild: true
            }
          }
          return fullChild
        })
      )
    },

    async mapChildren (person, seen) {
      return Promise.all(person.children.map(async child => {
        var childProfile = await this.loadDescendants(child.id, seen)
        if (!person.id) person.id = childProfile.parents[0].id

        // load the relationship between the two
        const relationship = await this.getWhakapapaLink(person.id, child.id)

        if (child.isNonChild) {
          childProfile = {
            ...childProfile,
            isNonChild: true
          }
        }

        if (!relationship) return childProfile

        childProfile.relationshipType = relationship.relationshipType
        childProfile.legallyAdoped = relationship.legallyAdoped

        return childProfile
      }))
    },

    async openContextMenu ({ event, profile }) {
      var fullProfile = await this.getRelatives(profile.id)
      this.setSelectedProfile(fullProfile)
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
        var profileInNestedWhakapapa = await tree.find(this.nestedWhakapapa, profile)
        if (profileInNestedWhakapapa) this.updateSelectedProfile(profileInNestedWhakapapa)
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
  async beforeDestroy () {
    if (!this.whakapapaView) return
    if (this.whakapapaView.name === 'Loading') return
    if (!this.whakapapaView.id) {
      console.error('Trying to save the record count without a whakapapa id', this.whakapapaView)
      return
    }

    if (!this.whakapapaView.canEdit) return
    if (this.whakapapaView.recordCount === 0) return
    if (this.whakapapaView.recordCount === this.recordCount) return

    // if there are more records here than are recorded, update the whakapapa-view
    const input = {
      id: this.whakapapaView.id,
      recordCount: this.recordCount
    }

    await this.saveWhakapapaView(input)
  },
  destroyed () {
    this.resetWhakapapaView()
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
