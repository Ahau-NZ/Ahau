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

      <v-row class="select mt-4" v-if="isLoadingProfiles || isLoadingWhakapapa">
        <v-progress-circular
          indeterminate
          :width="2"
          color="#b12526"
          class="pa-4"
        />
        <p class="overline pl-4" style="color:#b12526">{{isLoadingProfiles ? 'loading profiles...' : 'loading connections...'}}</p>
      </v-row>
      <v-expand-transition v-else-if="!mobile">
        <v-row class="select">
          <div class="icon-search">
          <SearchBar
            :searchFilter="false"
            @close="clickedOffSearch"
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
      </v-expand-transition>
      <!-- speed dial menu for mobile -->
      <v-expand-transition v-else-if="mobile">
        <v-card id="speeddial">
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
      </v-expand-transition>
      <Tree
        v-if="whakapapaView.tree"

        :class="mobile? 'mobile-tree':'tree'"

        :getRelatives="getRelatives"
        :showAvatars="showAvatars"
        @change-focus="setFocusToAncestorOf($event)"
      />
      <div v-if="whakapapaView.table" :class="mobile ? 'mobile-table' : 'whakapapa-table'">
        <Table
          ref="table"
          :download.sync="download"
        />
      </div>
    </v-container>

    <NodeMenu @open="updateDialog($event.dialog, $event.type)" />

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

      @persist-focus="processSaveWhakapapa({ focus: $event })"
      @update-whakapapa="processSaveWhakapapa"
      @delete-whakapapa="deleteWhakapapa"

      @set-focus="setViewFocus($event)"
      @set-focus-to-ancestor-of="setFocusToAncestorOf($event)"
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
import SearchButton from '@/components/button/SearchButton.vue'
import SearchFilterButton from '@/components/button/SearchFilterButton.vue'
import DialogHandler from '@/components/dialog/DialogHandler.vue'
import NodeMenu from '@/components/menu/NodeMenu.vue'

import avatarHelper from '@/lib/avatar-helpers.js'
import { getRelatives } from '@/lib/person-helpers.js'

export default {
  name: 'WhakapapaShow',
  components: {
    WhakapapaShowViewCard,
    TableButton,
    InfoButton,
    SearchBar,
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
  data () {
    return {
      accessOptions: [],
      fab: false,
      overflow: 'false',
      pan: 0,
      search: false,
      searchFilter: false,

      showWhakapapaHelper: false,
      // the record which defines the starting point for a tree (the 'focus')

      dialog: {
        active: null,
        type: null
      },

      download: false,
      showAvatars: true
    }
  },
  async mounted () {
    window.scrollTo(0, 0)

    this.loadWhakapapaView(this.$route.params.whakapapaId)
  },

  computed: {
    ...mapGetters(['whoami', 'isKaitiaki', 'loadingState']),
    ...mapGetters('person', ['selectedProfile', 'isLoadingProfiles']),
    ...mapGetters('tribe', ['tribes']),
    ...mapGetters('whakapapa', ['whakapapaView', 'isLoadingWhakapapa']),
    ...mapGetters('tree', ['getNode', 'getPartnerNode', 'searchedProfileId']),
    mobile () {
      return this.$vuetify.breakpoint.xs
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
  methods: {
    ...mapActions(['setLoading']),
    ...mapActions('person', ['setSelectedProfileById']),
    ...mapActions('whakapapa', [
      'loadWhakapapaView', 'resetWhakapapaView',
      'saveWhakapapaView',
      'setViewFocus', 'toggleViewMode'
    ]),
    ...mapActions('table', ['resetTableFilters']),
    toggleShowAvatars () {
      this.showAvatars = !this.showAvatars
    },
    tableOverflow (width) {
      const show = width > screen.width
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
      this.setSelectedProfileById(profile)
      if (this.dialog.active === 'view-edit-node') {
        this.updateDialog(null, null)
      }
      this.updateDialog(dialog, type)
    },
    updateDialog (dialog, type) {
      this.dialog.type = type
      this.dialog.active = dialog
    },
    // Used when adding top ancestor on a partner line & swapping between partner lines
    async setFocusToAncestorOf (profileId) {
      // TODO extract to vuex?
      this.updateDialog(null)
      const newFocus = await this.getWhakapapaHead(profileId)

      this.setSelectedProfileById(profileId)
      this.setViewFocus(newFocus)
    },
    async getWhakapapaHead (profileId, depth) {
      if (depth === 0) return profileId
      if (this.whakapapaView.focus === profileId) return profileId

      const record = await this.getRelatives(profileId)
      if (!record || !record.parents) return profileId

      const parent = record.parents.find(parent => !this.whakapapaView.ignoredProfiles.includes(parent.id))
      if (!parent) return profileId
      // NOTE - currently totally arbitrary which ancestors it follows
      // perhaps we let the user expand upwards in the direction they want?

      return this.getWhakapapaHead(parent.id, depth && depth - 1)
    },
    /*
      makes changes of a person to all their decendants
      without making calls to the db
    */
    async loadKnownFamily (loadProfile, person) {
      // TODO move this into vuex
      const { children, parents, partners, siblings, parent, relationshipType, legallyAdopted } = person
      let profile = {}

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
      this.setSelectedProfileById(event.profile)
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
    async processSaveWhakapapa (input) {
      input = {
        id: this.whakapapaView.id,
        ...input
      }

      await this.saveWhakapapaView(input)
    },
    async deleteWhakapapa () {
      const input = {
        tombstone: { date: new Date() }
      }

      await this.processSaveWhakapapa(input)

      // check the group we are going to is an admin one
      const parentGroup = this.tribes.find(tribe => tribe.admin && tribe.admin.id === this.$route.params.tribeId)
      const type = this.$route.name.split('/whakapapa')[0]

      if (parentGroup) {
        // navigate to the parent group instead if we found this group has one
        this.$router.push({ name: type + '/whakapapa', params: { tribeId: parentGroup.id, profileId: this.$route.params.profileId } }).catch(() => {})
      } else {
        this.$router.push({ name: type + '/whakapapa' }).catch(() => {})
      }
    },
    getImage () {
      return avatarHelper.defaultImage(this.aliveInterval, this.gender)
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
