<template>
  <v-container fluid class="body-width pa-0 niho-bg">
    <v-overlay dark :value="showArtefact" z-index="6" opacity="1" color="rgba(30,30,30)">
    </v-overlay>
    <!-- Header and Title -->
    <Header v-if="isProfile"
      :profile="profile"
    />
    <v-row v-if="isProfile">
      <v-col cols="12" offset-md="2" md="8" sm="12" :class="!mobile ? 'pl-12' : 'pt-0 mt-n3' " :align="mobile ? 'center' : 'start'" :order="mobile ? '3' : '1'">
        <h1 class="primary--text" :style="mobile ? length : ''">{{ title }}</h1>
      </v-col>
      <v-col :order="mobile ? '2' : '3'" :align="mobile || tablet ? 'end' : isCommunity ? 'start':'center'" cols="12" :md="isCommunity ? 1:2" class="px-5">
        <EditProfileButton v-if="profile.canEdit" @click="goEdit()" />
        <v-divider v-else class="py-5"></v-divider>
      </v-col>
    </v-row>
    <v-row>
      <!-- SideNav -->
      <v-col  v-if="!hideNav && !isWhakapapaShow" cols="12" xs="12" sm="12" md="2" lg="20p" :class="!mobile ? 'pr-0' : 'px-5 py-0'">
        <SideNavMenu :profile="profile" @new-registration="dialog = 'new-registration'"/>
      </v-col>
      <!-- Content -->
      <v-col cols="12" xs="12" sm="12" :md="isWhakapapaShow ? '12' : '10'" :lg="isWhakapapaShow ? '100p' : '80p'" :class="mobile ? isWhakapapaShow ? 'py-0' : 'px-6 py-0' : 'pl-0 py-0'">
        <transition
          name="fade"
          mode="out-in"
       >
        <router-view :key="JSON.stringify(profile)" :profile="profile" :tribe="tribe"></router-view>
      </transition>
      </v-col>
    </v-row>
    <v-spacer v-if="!mobile && !isWhakapapaShow" style="height:200px"></v-spacer>
    <NewCommunityDialog
      v-if="dialog === 'edit-community'"
      :show="dialog === 'edit-community'"
      editing
      :title="`Edit ${profile.preferredName}`"
      @delete="dialog = 'delete-community'"
      @submit="updateCommunity"
      @close="dialog = null"
      :profile="profile"
    />
    <EditNodeDialog
      v-if="dialog === 'edit-node'"
      :show="dialog === 'edit-node'"
      :title="`Edit ${profile.preferredName}`"
      @submit="updatePerson"
      @close="dialog = null"
      :profile="profile"
    />
    <DeleteCommunityDialog
      v-if="dialog === 'delete-community'"
      :show="dialog === 'delete-community'"
      @submit="deleteCommunity"
      @close="dialog = 'edit-community'"
    />
    <NewRegistrationDialog
      v-if="dialog === 'new-registration'"
      :show="dialog === 'new-registration'"
      :title="`Request to join : ${tribe.public[0].preferredName}`"
      :profile="profile"
      @submit="createGroupApplication"
      @close="dialog = null"
    />
  </v-container>
</template>

<script>
import isEmpty from 'lodash.isempty'

import SideNavMenu from '@/components/menu/SideNavMenu.vue'
import Header from '@/components/profile/Header.vue'
import EditProfileButton from '@/components/button/EditProfileButton.vue'
import mapProfileMixins from '@/mixins/profile-mixins.js'

import NewCommunityDialog from '@/components/dialog/community/NewCommunityDialog.vue'
import DeleteCommunityDialog from '@/components/dialog/community/DeleteCommunityDialog.vue'
import EditNodeDialog from '@/components/dialog/profile/EditNodeDialog.vue'
import NewRegistrationDialog from '@/components/dialog/registration/NewRegistrationDialog.vue'
import { updateTribe, deleteTribe, getMembers, getTribalProfile } from '@/lib/community-helpers.js'

import { createGroupApplication } from '@/lib/tribes-application-helpers.js'

import {
  mapGetters,
  mapMutations,
  createNamespacedHelpers
} from 'vuex'

const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

export default {
  name: 'ProfileShow',
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile', 'tribe'],
      mapMethods: ['saveProfile']
    })
  ],
  components: {
    SideNavMenu,
    Header,
    EditProfileButton,
    NewCommunityDialog,
    DeleteCommunityDialog,
    EditNodeDialog,
    NewRegistrationDialog
  },
  data () {
    return {
      profile: {},
      tribe: {},
      editing: false,
      dialog: null,
      parents: [],
      parentIndex: null,
      dialogType: null
    }
  },
  watch: {
    tribe: {
      deep: true,
      async handler (tribe) {
        if (!tribe.id) return
        try {
          const res = await this.$apollo.query(getMembers(tribe.id))
          if (res.errors) throw res.errors

          this.tribe.members = res.data.listGroupAuthors
          this.setCurrentAccess(getTribalProfile(tribe, this.whoami))
        } catch (err) {
          const message = 'Something went wrong while trying to fetch members'
          console.error(message)
          console.error(err)
          this.showAlert({ message, delay: 5000, color: 'red' })
        }
      }
    }
  },
  computed: {
    ...mapGetters(['whoami', 'showStory', 'showArtefact', 'currentNotification']),
    title () {
      if (this.profile.legalName) return this.profile.legalName
      else return this.profile.preferredName
    },
    isProfile () {
      return this.$route.name === 'person/profile' || this.$route.name === 'community/profile'
    },
    isWhakapapaShow () {
      return this.$route.name === 'person/whakapapa/:whakapapaId' || this.$route.name === 'community/whakapapa/:whakapapaId'
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    tablet () {
      return this.$vuetify.breakpoint.md
    },
    isCommunity () {
      return this.profile.type === 'community'
    },
    length () {
      var name = ''
      if (this.profile.legalName) name = this.profile.legalName
      else if (this.profile.preferredName) name = this.profile.preferredName
      if (name.length > 30) return 'font-size:6vw'
      if (name.length > 25) return 'font-size:7vw'
      if (name.length > 20) return 'font-size:8vw'
      else return 'font-size: 10vw'
    },
    hideNav () {
      if (this.mobile && this.showStory) return true
      else return false
    }
  },
  methods: {
    ...mapAlertMutations(['showAlert']),
    ...mapMutations(['updateSelectedProfile', 'setCurrentAccess']),
    goEdit () {
      if (this.profile.type === 'person') this.dialog = 'edit-node'
      else this.dialog = 'edit-community'
    },
    // TOTO if these need to be used elsewhere, move to a mixin
    async updateCommunity ($event) {
      if (isEmpty($event)) {
        this.showAlert({ message: 'No changes submitted' })
        this.closeDialog()
      }

      try {
        const res = await this.$apollo.mutate(
          updateTribe(this.tribe, $event)
        )

        if (res.errors) throw res.errors

        this.closeDialog()
        this.refresh()
        this.showAlert({ message: 'Successfully updated the community' })
      } catch (err) {
        const message = 'Something went wrong when saving the tribe'
        console.error(message, this.tribe)
        console.error(err)
        this.showAlert({ message })
        this.closeDialog()
      }
    },
    async updatePerson ($event) {
      // attach the id to the input
      const input = { id: this.profile.id, ...$event }
      await this.saveProfile(input)
      this.closeDialog()
      this.refresh()
      this.showAlert({ message: 'The profile was updated!' })
    },
    async deleteCommunity () {
      try {
        const res = await this.$apollo.mutate(
          deleteTribe(this.tribe)
        )

        if (res.errors) throw res.errors
        this.showAlert({ message: 'community successfully deleted' })
        this.$router.push('/tribe').catch(() => {})
      } catch (err) {
        const message = 'Something went wrong while trying to delete the community'
        console.error(message, this.tribe.id)
        console.error(err)
        this.showAlert({ message, delay: 5000, color: 'red' })
        this.dialog = 'edit-community'
      }
    },
    async createGroupApplication (text) {
      try {
        this.$apollo.mutate(
          createGroupApplication({
            groupId: this.tribe.id,
            groupAdmins: [...this.tribe.public[0].tiaki.map(d => d.feedId)],
            text
          })
        )
      } catch (err) {
        console.error('Something went wrong while create a group application', err)
      }
    },
    closeDialog () {
      this.dialog = null
    },
    refresh () {
      // tell apollo to refresh the current tribe and profile queries
      this.$apollo.queries.tribe.refetch()
      this.$apollo.queries.profile.refetch()
    }
  }
}
</script>

<style lang="scss">
@media (min-width: 1264px) and (max-width: 1903px) {
  .col-lg-20p {
    width: 20%;
    max-width: 20%;
    flex-basis: 20%;
  }
  .col-lg-60p {
    width: 60%;
    max-width: 60%;
    flex-basis: 60%;
  }
  .col-lg-80p {
    width: 80%;
    max-width: 80%;
    flex-basis: 80%;
  }
}

.body-width {
  max-width: 100vw;
}

.niho-bg {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.99),
  rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
  background-position-x: 100px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

/* .fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2;
  transition-property: top;
  transition-timing-function: ease-in-out;
 } */

 .fade-enter-active {
    transition: all 0.6s ease-in-out;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

</style>
