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
      <div :class="mobile ? '' : 'align-self-end mr-10 order-3'">
        <ProfileButton
          v-if="profile.canEdit"
          @click="goEdit"
          icon="mdi-account-cog"
          :label="editButtonLabel"
        />
        <v-divider v-else class="py-5"></v-divider>
      </div>
    </v-row>

    <v-row>
      <!-- SideNav -->
      <v-col  v-if="!hideNav && !isWhakapapaShow" cols="12" xs="12" sm="12" md="2" lg="20p" :class="!mobile ? 'pr-0' : 'px-5 py-0'">
        <SideNavMenu v-if="currentTribe" :profile="profile" @new-registration="dialog = 'new-registration'"/>
      </v-col>

      <!-- Content -->
      <v-col cols="12" xs="12" sm="12"
        :md="isWhakapapaShow ? '12' : '10'"
        :lg="isWhakapapaShow ? '100p' : '80p'"
        :class="mobile ? isWhakapapaShow ? 'py-0' : 'px-6 py-0' : 'pl-0 py-0'"
      >
        <v-overlay dark :value="showArtefact" z-index="6" opacity="1" color="rgba(30,30,30)" />
        <transition name="fade" mode="out-in">
          <router-view :key="JSON.stringify(profile)" :profile="profile" />
        </transition>
      </v-col>
    </v-row>
    <v-spacer v-if="addBottomSpacer" style="height:200px"></v-spacer>

    <NewCommunityDialog
      v-if="dialog === 'edit-community'"
      :show="dialog === 'edit-community'"
      editing
      :title="$t('addPersonForm.addPersonFormTitle', { displayName: profile.preferredName })"
      @delete="dialog = 'delete-community'"
      @submit="processUpdateCommunity"
      @close="dialog = null"
      :profile="mergeTribeProfiles(currentTribe)"
    />
    <EditNodeDialog
      v-if="dialog === 'edit-node'"
      :show="dialog === 'edit-node'"
      :title="$t('addPersonForm.addPersonFormTitle', { displayName: getDisplayName(profile) })"
      @submit="processUpdatePerson"
      @close="dialog = null"
      :nodeProfile="profile"
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
      :title="`Request to join : ${tribeProfile.preferredName}`"
      :profile="profile"
      @submit="createGroupApplication"
      @close="dialog = null"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import get from 'lodash.get'

import SideNavMenu from '@/components/menu/SideNavMenu.vue'
import Header from '@/components/profile/Header.vue'
import ProfileButton from '@/components/button/ProfileButton.vue'

import NewCommunityDialog from '@/components/dialog/community/NewCommunityDialog.vue'
import DeleteCommunityDialog from '@/components/dialog/community/DeleteCommunityDialog.vue'
import EditNodeDialog from '@/components/dialog/profile/EditNodeDialog.vue'
import NewRegistrationDialog from '@/components/dialog/registration/NewRegistrationDialog.vue'

import mapProfileMixins from '@/mixins/profile-mixins.js'
import { deleteTribe, mergeTribeProfiles } from '@/lib/community-helpers.js'
import { createGroupApplication, copyProfileInformation } from '@/lib/tribes-application-helpers.js'
import { getDisplayName } from '@/lib/person-helpers.js'

export default {
  name: 'ProfileShow',
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  components: {
    SideNavMenu,
    Header,
    NewCommunityDialog,
    DeleteCommunityDialog,
    EditNodeDialog,
    NewRegistrationDialog,
    ProfileButton
  },
  data () {
    return {
      profile: {},
      editing: false,
      dialog: null,
      parents: [],
      parentIndex: null,
      dialogType: null,
      source: null,
      isApplication: false
    }
  },
  watch: {
    '$route.params' (params) {
      if (!params.application) return
      const { dialog, source } = params.application

      this.dialog = dialog
      this.source = source

      this.isApplication = true
    }
  },
  computed: {
    ...mapGetters(['whoami', 'isKaitiaki', 'linkedProfiles', 'getPersonalProfileInTribe']),
    ...mapGetters('tribe', ['tribes', 'tribeProfile', 'currentTribe', 'isPersonalTribe', 'customFieldsByTribe']),
    ...mapGetters('archive', ['showStory', 'showArtefact']),
    personalProfileCopy () {
      return copyProfileInformation(this.whoami.personal.profile)
    },
    title () {
      if (this.profile.legalName) return this.profile.legalName
      else return this.profile.preferredName
    },
    editButtonLabel () {
      if (this.isPersonalTribe) return this.t('accountSettings')
      if (this.isCommunity) return this.t('tribeSettings')

      return this.t('editProfile')
    },
    isProfile () {
      return this.$route.name === 'person/profile' || this.$route.name === 'community/profile'
    },
    isWhakapapaShow () {
      return this.$route.name === 'person/whakapapa/:whakapapaId' || this.$route.name === 'community/whakapapa/:whakapapaId'
    },
    isPersonList () {
      return this.$route.name === 'personIndex'
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    tablet () {
      return this.$vuetify.breakpoint.md
    },
    isCommunity () {
      return this.profile.type === 'community'
    },
    length () {
      let name = ''
      if (this.profile.legalName) name = this.profile.legalName
      else if (this.profile.preferredName) name = this.profile.preferredName
      if (name.length > 30) return 'font-size:6vw; text-align:center; margin-left:15px; margin-right:15px'
      if (name.length > 25) return 'font-size:7vw'
      if (name.length > 20) return 'font-size:8vw'
      else return 'font-size: 10vw'
    },
    hideNav () {
      if (this.mobile && this.showStory) return true
      else return false
    },
    addBottomSpacer () {
      return (
        !this.mobile &&
        !this.isWhakapapaShow &&
        !this.isPersonList
      )
    }
  },
  methods: {
    getDisplayName,
    mergeTribeProfiles,
    ...mapActions(['setWhoami']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('tribe', ['addAdminsToGroup', 'getMembers', 'loadTribe']),
    ...mapActions('person', ['updatePerson']),
    ...mapActions('community', ['updateCommunity']),
    goEdit () {
      if (this.profile.type.startsWith('person')) this.dialog = 'edit-node'
      else this.dialog = 'edit-community'
    },
    async processUpdateCommunity ($event) {
      if (isEmpty($event)) {
        this.showAlert({ message: this.t('noChanges'), color: 'green' })
        this.closeDialog()
        return
      }

      const input = $event

      // process the authors
      if (input.authors) {
        if (!input.authors.add) delete input.authors
        else {
          const adminIds = input.authors.add

          await this.addAdminsToGroup({ groupId: this.currentTribe.id, adminIds })
        }
      }

      await this.updateCommunity({ tribe: this.currentTribe, input })
      this.closeDialog()
      await this.refresh()
      this.showAlert({ message: this.t('profileUpdated'), color: 'green' })
    },
    async processUpdatePerson (input) {
      const customFields = input.customFields
      input.id = this.profile.id
      delete input.customFields

      if (Object.keys(input).length > 1) {
        await this.updatePerson(input)
      }

      await this.processCustomFieldUpdates(customFields)
      await this.handleClose()
    },
    async handleClose () {
      this.closeDialog()
      await this.refresh()

      this.showAlert({ message: this.t('profileUpdated'), color: 'green' })

      if (this.whoami.personal.profile.id === this.profile.id) await this.setWhoami()

      if (this.isApplication) {
        this.goProfile()
      }
    },
    async processCustomFieldUpdates (customFields) {
      if (isEmpty(customFields)) return

      await Promise.all(
        Object.entries(customFields).map(([tribeId, customFieldsByTribe]) => {
          const profile = this.getPersonalProfileInTribe(tribeId)

          if (!profile) return null

          const customFieldChanges = Object.entries(customFieldsByTribe)
            .map(([key, value]) => ({ key, value }))
            .filter(({ key, value }) => {
              const tribe = this.customFieldsByTribe.find(tribe => tribe.tribeId === tribeId)
              const field = tribe.customFields.find(field => field.key === key)
              if (!field) return false

              const valueOnProfile = profile.customFields.find(field => field.key === key)

              // only keep those where the value has changes
              return (!isEqual(get(valueOnProfile, 'value'), value) && !isEqual(value, this.getDefaultFieldValue(field)))
            })

          if (!customFieldChanges || !customFieldChanges.length) return null

          return this.updatePerson({ id: profile.id, customFields: customFieldChanges })
        })
      )
    },
    // TODO: move this to a helper
    getDefaultFieldValue (field) {
      switch (field.type) {
        case 'list':
          return []
        case 'array':
          return ['']
        case 'text':
          return ''
        case 'checkbox':
          return false
        default:
          return null
      }
    },
    async deleteCommunity () {
      try {
        const res = await this.$apollo.mutate(
          deleteTribe(this.currentTribe)
        )

        if (res.errors) throw res.errors
        this.showAlert({ message: this.t('communityDeleted'), color: 'green' })
        this.$router.push('/tribe').catch(() => {})
      } catch (err) {
        console.error(this.t('failCommunityDeleted'), this.currentTribe.id)
        console.error(err)
        this.showAlert({ message: this.t('failCommunityDeleted'), delay: 5000, color: 'red' })
        this.dialog = 'edit-community'
      }
    },
    async createGroupApplication ({ comment, answers, customFields }) {
      try {
        const res = this.$apollo.mutate(
          createGroupApplication({
            groupId: this.currentTribe.id,
            comment,
            answers,
            customFields
          })
        )

        if (res.errors) throw res.errors
        else {
          // flag for snackbar "request successfully sent"
          this.showAlert({ message: this.t('requestSent'), delay: 5000, color: 'green' })
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
    async refresh () {
      // tell apollo to refresh the current tribe and profile queries
      await this.loadTribe(this.currentTribe.id)
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
  background: linear-gradient(to right, rgba(255, 255, 255, 0.8),
  rgba(255, 255, 255, 0.7)), url(@/assets/niho.svg);
  background-position-x: 100px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

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
