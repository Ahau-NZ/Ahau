<template>
  <v-container fluid class="pa-0 niho-bg">
    <!-- Header and Title -->
    <Header v-if="isProfile"
      :profile="profile"
    />
    <v-row v-if="isProfile">
      <div :class="mobile ? 'mobile-title order-3 d-flex':'desktop-title order-1 mr-auto'">
        <h1 class="primary--text" :style="mobile ? length : ''">{{ title }}</h1>
      </div>
      <div :class="mobile ? 'mob-btn order-1':'align-self-end order-2'">
        <ProfileButton
          v-if="myProfile"
          @click="toggleSettings"
          icon="mdi-cog"
          :label="t('settings')"
        />
      </div>
      <div :class="mobile ? 'edit-mob-btn order-2':'align-self-end mr-10 order-3'">
        <ProfileButton
          v-if="profile.canEdit"
          @click="goEdit"
          icon="mdi-account-edit"
          :label="t('editProfile')"
        />
        <v-divider v-else class="py-5"></v-divider>
      </div>
    </v-row>
    <v-row>
      <!-- SideNav -->
      <v-col  v-if="!hideNav && !isWhakapapaShow" cols="12" xs="12" sm="12" md="2" lg="20p" :class="!mobile ? 'pr-0' : 'px-5 py-0'">
        <SideNavMenu :profile="profile" @new-registration="dialog = 'new-registration'"/>
      </v-col>
      <!-- Content -->
      <v-col cols="12" xs="12" sm="12" :md="isWhakapapaShow ? '12' : '10'" :lg="isWhakapapaShow ? '100p' : '80p'" :class="mobile ? isWhakapapaShow ? 'py-0' : 'px-6 py-0' : 'pl-0 py-0'">
        <v-overlay dark :value="showArtefact" z-index="6" opacity="1" color="rgba(30,30,30)" />
        <transition name="fade" mode="out-in">
          <router-view :key="JSON.stringify(profile)" :profile="profile" :tribe="tribe" />

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
      :title="`Edit ${getDisplayName(profile)}`"
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
    <SettingsDialog
      v-if="dialog === 'settings'"
      :show="dialog === 'settings'"
      @close="dialog = null"
    />
    <!-- Snackbar for successful Tribe request sent -->
    <v-snackbar
      v-model="joinRequestSent"
      color="green"
      content-class="text-center"
    >
      Request successfully sent
    </v-snackbar>
  </v-container>
</template>

<script>
import isEmpty from 'lodash.isempty'

import SideNavMenu from '@/components/menu/SideNavMenu.vue'
import Header from '@/components/profile/Header.vue'
import ProfileButton from '@/components/button/ProfileButton.vue'
import mapProfileMixins from '@/mixins/profile-mixins.js'

import NewCommunityDialog from '@/components/dialog/community/NewCommunityDialog.vue'
import DeleteCommunityDialog from '@/components/dialog/community/DeleteCommunityDialog.vue'
import EditNodeDialog from '@/components/dialog/profile/EditNodeDialog.vue'
import NewRegistrationDialog from '@/components/dialog/registration/NewRegistrationDialog.vue'
import SettingsDialog from '@/components/dialog/SettingsDialog.vue'
import { updateTribe, deleteTribe, getMembers, getTribalProfile } from '@/lib/community-helpers.js'

import { createGroupApplication } from '@/lib/tribes-application-helpers.js'
import { getDisplayName } from '@/lib/person-helpers.js'

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
    NewCommunityDialog,
    DeleteCommunityDialog,
    EditNodeDialog,
    NewRegistrationDialog,
    SettingsDialog,
    ProfileButton
  },
  data () {
    return {
      profile: {},
      tribe: {},
      editing: false,
      dialog: null,
      parents: [],
      parentIndex: null,
      dialogType: null,
      source: null,
      isApplication: false,
      joinRequestSent: false
    }
  },
  watch: {
    tribe: {
      deep: true,
      async handler (tribe) {
        if (!tribe.id) return
        try {
          const res = await this.$apollo.query(
            getMembers(tribe.id)
          )

          if (res.errors) throw res.errors

          this.tribe.members = res.data.listGroupAuthors
          this.setCurrentAccess(
            getTribalProfile(tribe, this.whoami)
          )
        } catch (err) {
          const message = 'Something went wrong while trying to fetch members'
          console.error(message)
          console.error(err)
          this.showAlert({ message, delay: 5000, color: 'red' })
        }
      }
    },
    '$route.params' (params) {
      if (!params.application) return
      const { dialog, source } = params.application

      this.dialog = dialog
      this.source = source

      this.isApplication = true
    }
  },
  computed: {
    ...mapGetters(['whoami', 'showStory', 'showArtefact']),
    myProfile () {
      return this.whoami.personal.groupId === this.tribe.id
    },
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
    getDisplayName,
    ...mapAlertMutations(['showAlert']),
    ...mapMutations(['updateSelectedProfile', 'setCurrentAccess']),
    goEdit () {
      if (this.profile.type === 'person') this.dialog = 'edit-node'
      else this.dialog = 'edit-community'
    },
    toggleSettings () {
      this.dialog = 'settings'
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

      if (this.isApplication) {
        this.goProfile()
      }
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
    async createGroupApplication ({ comment, answers }) {
      try {
        const res = this.$apollo.mutate(
          createGroupApplication({
            groupId: this.tribe.id,
            groupAdmins: [...this.tribe.public[0].tiaki.map(d => d.feedId)],
            comment,
            answers
          })
        )

        if (res.errors) throw res.errors
        else {
          // flag for snackbar "request successfully sent"
          this.joinRequestSent = true
        }

        // return res.data.createGroupApplication // return the applicationId
      } catch (err) {
        console.error('Something went wrong while create a group application', err)
      }
    },
    goProfile () {
      this.$router.push({
        name: 'community/profile',
        params: {
          tribeId: this.source.tribeId,
          profileId: this.source.profileId,
          application: {
            dialog: 'new-registration',
            source: {
              tribeId: this.$route.params.tribeId,
              profileId: this.$route.params.profileId
            }
          }
        }
      }).catch(() => {})
    },
    closeDialog () {
      this.dialog = null
    },
    refresh () {
      // tell apollo to refresh the current tribe and profile queries
      this.$apollo.queries.tribe.refetch()
      this.$apollo.queries.profile.refetch()
    },
    t (key, vars) {
      return this.$t('viewPerson.' + key, vars)
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

  .desktop-title {
    margin-left: 20%;
    margin-top: 22px
  }

  .mobile-title {
    width: 100%;
    max-width:100%;
    justify-content: center;
    position: relative;
    top: 10px
  }

  .mob-btn {
    padding-left: 12px;
    padding-top: 6px;
    width: 50%;
    max-width: 50%;
    flex-basis: 50%;
  }

  .edit-mob-btn {
    padding-right: 12px;
    padding-top: 6px;
    width: 50%;
    max-width: 50%;
    flex-basis: 50%;
    display: flex;
    justify-content: flex-end;
  }

</style>
