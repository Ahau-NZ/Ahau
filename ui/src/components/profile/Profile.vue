<template>
  <v-row :class="mobile ? 'mobile-profile':''">
    <v-col v-if="!isLoaded" cols="12" md="9" :class="mobile ? 'pt-7 px-5' : ' pt-0 px-5' ">
      <SkeletonLoader
        cols=12
        :totalSkeletons=1
        skeletonType="card-heading"
      />
      <SkeletonLoader
        cols=12
        :totalSkeletons=2
        skeletonType="card-heading, image"
      />
      <SkeletonLoader
        cols=12
        :totalSkeletons=1
        skeletonType="card-heading, image@2"
      />
    </v-col>

    <v-col v-else cols="12" md="9" :class="mobile ? 'pt-7 px-5' : ' pt-0 px-5' ">
      <v-col cols="12" :class="mobile ? 'mobile-profile-label headliner':'profile-info-label headliner'">
        {{ $t('viewPerson.viewPersonTitle') }}
      </v-col>
      <ProfileInfoCard
        :myProfile="myProfile"
        :profile="profile"
        @setupProfile="setupProfile($event)"
        style="max-width: 1175px"
      />

      <template v-if="myProfile">
        <v-col cols="12" :class="mobile ? 'mobile-profile-label headliner':'profile-info-label headliner'">
          {{ $t('viewPerson.skillsEducationTitle') }}
        </v-col>
        <ProfileCard
          style="max-width: 1200px"
        >
          <template v-slot:content>
            <v-row cols="12" class="pt-0" >
              <ProfileInfoItem class="bb" smCols="12" mdCols="12"  :title="$t('viewPerson.profession')" :value="profile.profession"/>
              <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="6" :title="$t('viewPerson.schools')" :value="profile.school.join('\n')"/>
              <ProfileInfoItem smCols="12" mdCols="6" :title="$t('viewPerson.skills')" :value="profile.education.join('\n')"/>
            </v-row>
          </template>
        </ProfileCard>
      </template>

      <v-col cols="12" :class="mobile ? 'mobile-profile-label headliner':'profile-info-label headliner'">
        {{ $t('viewPerson.contactInfo.contactInfoTitle') }}
      </v-col>
      <ProfileCard style="max-width: 1200px">
        <template v-slot:content>
          <v-row cols="12" class="pt-0" >
            <ProfileInfoItem :class="mobile ? 'bb':'br bb'" smCols="12" mdCols="6" :title="$t('viewPerson.contactInfo.phone')" :value="profile.phone"/>
            <ProfileInfoItem class="bb" smCols="12" mdCols="6" :title="$t('viewPerson.contactInfo.email')" :value="profile.email"/>
            <ProfileInfoItem :class="mobile ? 'bb':'br bb'" smCols="12" mdCols="6" :title="$t('viewPerson.contactInfo.address')" :value="profile.address"/>
            <ProfileInfoItem class="bb" smCols="12" mdCols="6" :title="$t('viewPerson.contactInfo.city')" :value="profile.city"/>
            <ProfileInfoItem class="br" smCols="6" mdCols="6" :title="$t('viewPerson.contactInfo.country')" :value="profile.country"/>
            <ProfileInfoItem smCols="6" mdCols="6" :title="$t('viewPerson.contactInfo.postcode')" :value="profile.postCode"/>
          </v-row>
        </template>
      </ProfileCard>
    </v-col>

    <!-- RIGHT SIDE COLUMN -->
    <v-col v-if="!isLoaded" cols="12" sx="12" md="3" :class="{ 'pt-0 px-5':mobile, 'pt-10 pr-8':myProfile && !mobile, 'pt-12 pr-8':!myProfile }">
      <SkeletonLoader
        :totalSkeletons=1
        skeletonType="card-heading, divider, list-item-avatar-two-line@6, divider"
      />

      <SkeletonLoader
        class="mt-16"
        :totalSkeletons=1
        skeletonType="card-heading, divider, list-item-avatar-two-line@6, divider"
      />
    </v-col>
    <v-col v-else cols="12" sx="12" md="3" :class="{ 'pt-0 px-5':mobile, 'pt-10 pr-8':myProfile && !mobile, 'pt-12 pr-8':!myProfile }">
      <template v-if="myProfile">
        <v-col v-if="mobile" cols="12" class="mobile-profile-label headliner">
            {{ $t('viewPerson.tribes') }}
        </v-col>
        <ProfileCard v-if="myProfile" :title="mobile ? '':$t('viewPerson.tribes')" class="mt-2">
          <template v-slot:content>
            <div v-if="connectedTribes.length > 0" :class="{'pt-4':mobile}">
              <v-row v-for="tribe in connectedTribes" :key="tribe.id" class="justify-center align-center ma-0 ml-4">
                <v-col cols="2" class="pt-0 pl-0">
                  <router-link :to="goTribe(tribe)">
                    <Avatar :size="mobile ? '50px' : '40px'" :image="tribe.private[0].avatarImage" :alt="tribe.private[0].preferredName" :isView="!tribe.private[0].avatarImage" clickable/>
                  </router-link>
                </v-col>
                <v-col class="py-0">
                  <router-link :to="goTribe(tribe)">
                    <p style="color:black;">{{ tribe.private[0].preferredName }}</p>
                  </router-link>
                </v-col>
              </v-row>
            </div>
            <router-link v-else to="/tribe">
              <p class="pl-3 pt-3 caption"> + Click here to discover your tribes</p>
            </router-link>
          </template>
        </ProfileCard>
      </template>
      <ProfileCard v-if="!myProfile" title="Kaitiaki" class="mt-0 px-0">
        <template v-slot:content>
          <div>
            <v-row  v-for="({ profile: kaitiaki }, i) in profile.kaitiaki" :key="i" class="justify-center align-center ma-0 ml-4">
              <v-col cols="2" class="pt-0 pl-0">
                <Avatar :size="mobile ? '50px' : '40px'" :image="kaitiaki.avatarImage" :alt="kaitiaki.preferredName" />
              </v-col>
              <v-col  class="py-0">
                <p style="color:black;">{{ getDisplayName(kaitiaki) }}</p>
              </v-col>
            </v-row>
          </div>
        </template>
      </ProfileCard>

      <ProfileCard v-if="profile.type === 'community' && !nonMember" title="Members">
        <template v-slot:content>
          <v-row v-for="member in members" :key="member.id" class="justify-center align-center ma-0 ml-4">
            <v-col cols="2" class="pt-0 pl-0">
              <Avatar :size="mobile ? '50px' : '40px'" :image="member.avatarImage" :alt="member.preferredName" :gender="member.gender" clickable @click="openProfile(member)"/>
            </v-col>
            <v-col class="py-0">
              <p style="color:black;">{{ getDisplayName(member) }}</p>
            </v-col>
          </v-row>
        </template>
      </ProfileCard>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import Avatar from '@/components/Avatar.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

import { getDisplayName } from '@/lib/person-helpers.js'

export default {
  name: 'Profile',
  components: {
    ProfileInfoCard,
    ProfileCard,
    ProfileInfoItem,
    Avatar,
    SkeletonLoader
  },
  props: {
    profile: Object,
    tribe: Object
  },
  async beforeMount () {
    await this.getTribes()
  },
  mounted () {
    window.scrollTo(0, 0)
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('tribe', ['tribes']),
    myProfile () {
      return this.profile.id === this.whoami.personal.profile.id
    },
    connectedTribes () {
      return this.tribes.filter(tribe => tribe.private.length > 0)
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    nonMember () {
      return (
        this.profile.type === 'community' &&
        !this.profile.recps
      )
    },
    isLoaded () {
      return Boolean(this.profile && this.profile.id)
    },
    members () {
      if (!this.tribe.members) return
      return this.tribe.members
        .filter((member) => {
          return !this.profile.authors.some(kaitiaki => {
            return kaitiaki.feedId === member.feedId
          })
        })
    }
  },
  methods: {
    ...mapActions(['setDialog']),
    ...mapActions('tribe', ['getTribes']),
    ...mapActions('person', ['setProfileById']),

    goTribe (tribe) {
      var profile = tribe.private.length > 0
        ? tribe.private[0]
        : tribe.public[0]

      return {
        name: profile.type,
        params: { tribeId: tribe.id, profileId: profile.id, profile }
      }
    },
    openProfile (profile) {
      this.setProfileById({ id: profile.id, type: 'preview' })
      this.setDialog({ active: 'view-edit-node', type: 'preview' })
    },
    getDisplayName
  }
}
</script>
<style lang="scss">
  .mobile-profile {
    margin-top:60px
  }
  .rounded-card {
    border-radius: 10px;

    &p {
      font-size: 0.8em;
      line-height: 1.6;
      color: #383838
    }
  }

  .first-row {
    height: 70px;
  }

  .br {
  border-right: 0.5px solid rgba(0,0,0,0.3);
  }

  .profile-info-label {
    color: #000000 !important;
    caret-color: #000000 !important;
    padding-left: 16px !important;
    padding-bottom: 8px !important;
    padding-top: 16px !important;
    letter-spacing: 5px;
  }

  .mobile-profile-label {
    color: #000000 !important;
    caret-color: #000000 !important;
    letter-spacing: 3px !important;
    padding-top:16px;
    padding-bottom: 8px !important;
    padding-left: 16px !important;
  }

</style>
