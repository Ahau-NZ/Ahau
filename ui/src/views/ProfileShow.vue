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
      <v-col cols="12" xs="12" sm="12"
        :md="isWhakapapaShow ? '12' : '10'"
        :lg="isWhakapapaShow ? '100p' : '80p'"
        :class="mobile ? isWhakapapaShow ? 'py-0' : 'px-6 py-0' : 'pl-0 py-0'"
      >
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
      :title="$t('addPersonForm.addPersonFormTitle', { displayName: profile.preferredName })"
      @delete="dialog = 'delete-community'"
      @submit="processUpdateCommunity"
      @close="dialog = null"
      :profile="profile"
      :tribe="tribe"
    />
    <EditNodeDialog
      v-if="dialog === 'edit-node'"
      :show="dialog === 'edit-node'"
      :title="$t('addPersonForm.addPersonFormTitle', { displayName: getDisplayName(profile) })"
      @submit="updatePerson"
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
      :title="`Request to join : ${tribe.public[0].preferredName}`"
      :profile="profile"
      @submit="createGroupApplication"
      @close="dialog = null"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import isEmpty from 'lodash.isempty'

import SideNavMenu from '@/components/menu/SideNavMenu.vue'
import Header from '@/components/profile/Header.vue'
import ProfileButton from '@/components/button/ProfileButton.vue'

import NewCommunityDialog from '@/components/dialog/community/NewCommunityDialog.vue'
import DeleteCommunityDialog from '@/components/dialog/community/DeleteCommunityDialog.vue'
import EditNodeDialog from '@/components/dialog/profile/EditNodeDialog.vue'
import NewRegistrationDialog from '@/components/dialog/registration/NewRegistrationDialog.vue'

import mapProfileMixins from '@/mixins/profile-mixins.js'
import { deleteTribe } from '@/lib/community-helpers.js'
import { createGroupApplication, copyProfileInformation } from '@/lib/tribes-application-helpers.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import { ACCESS_PRIVATE, ACCESS_KAITIAKI, ACCESS_ALL_MEMBERS } from '@/lib/constants'

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
      isApplication: false
    }
  },
  watch: {
    tribe: {
      deep: true,
      immediate: true,
      async handler (tribe) {
        // 2021-12-02 mix: this all feels like logic that should be collected somewhere else
        // Anti-patterns:
        //   - bolting data onto existing profiles which might mutate
        //   - watching for data changes instead of just requesting the exact data you need

        if (!tribe || !tribe.id || !this.whoami) return

        const groupId = tribe.id

        // if we are looking at our personal group
        if (this.whoami.personal.groupId === groupId) {
          this.setIsKaitiaki(true)
          this.setCurrentAccess({
            type: ACCESS_PRIVATE,
            groupId: this.whoami.personal.groupId,
            profileId: this.whoami.personal.profile.id
          })
        } else {
          // otherwise we are looking at another group which could be:
          // 1. a group
          // 2. an admin-only subgroup

          // check if we are the kaitiaki of this group
          const isKaitiaki = tribe.public.length
            ? tribe.public[0].kaitiaki.some(tiaki => tiaki.feedId === this.whoami.public.feedId)
            : false

          this.setIsKaitiaki(isKaitiaki)

          // load the members of this group
          this.tribe.members = await this.getMembers(groupId) || []

          // check if this group has a parentGroup
          const parentGroup = this.tribes.find(otherTribe => otherTribe.admin && otherTribe.admin.id === groupId)

          // if it does, it means we are looking at an admin-only subgroup
          if (parentGroup) {
            // find the parent groups profile and use that instead
            const profileId = (parentGroup.private && parentGroup.private.length ? parentGroup.private[0] : parentGroup.public[0]).id
            this.setCurrentAccess({
              type: ACCESS_KAITIAKI,
              groupId,
              profileId // community profileId of the parentGroup
            })
          } else {
            // no parent group means we are already on a parent group
            const profileId = (tribe.private.length ? tribe.private[0] : tribe.public[0]).id

            this.profile.joiningQuestions = (tribe.public.length)
              ? tribe.public[0].joiningQuestions
              : []

            this.setCurrentAccess({
              type: ACCESS_ALL_MEMBERS,
              groupId,
              profileId // community profileId
            })
          }
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
    ...mapGetters(['whoami', 'isKaitiaki']),
    ...mapGetters('tribe', ['tribes']),
    ...mapGetters('archive', ['showStory', 'showArtefact']),
    ...mapGetters('tribe', ['tribes']),
    myProfile () {
      return this.whoami.personal.groupId === this.tribe.id
    },
    personalProfileCopy () {
      return copyProfileInformation(this.whoami.personal.profile)
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
      return this.$vuetify.breakpoint.xs
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
      if (name.length > 30) return 'font-size:6vw; text-align:center; margin-left:15px; margin-right:15px'
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
    ...mapMutations(['setIsKaitiaki']),
    ...mapActions(['setWhoami', 'setCurrentAccess']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('tribe', ['addAdminsToGroup', 'getMembers']),
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

          await this.addAdminsToGroup({ groupId: this.tribe.id, adminIds })
        }
      }

      await this.updateCommunity({ tribe: this.tribe, input })
      this.closeDialog()
      await this.refresh()
    },
    async updatePerson ($event) {
      // attach the id to the input
      const input = { id: this.profile.id, ...$event }
      await this.saveProfile(input)
      this.closeDialog()
      this.refresh()
      this.showAlert({ message: this.t('profileUpdated'), color: 'green' })

      if (this.whoami.personal.profile.id === this.profile.id) await this.setWhoami()

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
        this.showAlert({ message: this.t('communityDeleted'), color: 'green' })
        this.$router.push('/tribe').catch(() => {})
      } catch (err) {
        console.error(this.t('failCommunityDeleted'), this.tribe.id)
        console.error(err)
        this.showAlert({ message: this.t('failCommunityDeleted'), delay: 5000, color: 'red' })
        this.dialog = 'edit-community'
      }
    },
    async createGroupApplication ({ comment, answers }) {
      try {
        const res = this.$apollo.mutate(
          createGroupApplication({
            groupId: this.tribe.id,
            comment,
            answers
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
  background: linear-gradient(to right, rgba(255, 255, 255, 0.8),
  rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
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
