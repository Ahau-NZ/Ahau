<template>
  <v-row :class="mobile ? 'mobile-profile':''">
    <v-col cols="12" md="9" :class="mobile ? 'pt-7 px-5' : ' pt-0 px-5' ">
      <v-col cols="12" :class="mobile ? 'mobile-profile-label headliner':'profile-info-label headliner'">
        profile information
      </v-col>
      <ProfileInfoCard :myProfile="myProfile" :profile="profile" @setupProfile="setupProfile($event)"/>
      <template v-if="myProfile">
        <v-col cols="12" :class="mobile ? 'mobile-profile-label headliner':'profile-info-label headliner'">
          skills and education
        </v-col>
        <ProfileCard>
          <template v-slot:content>
            <v-row cols="12" class="pt-0" >
              <ProfileInfoItem :class="mobile ? 'bb':'br bb'" smCols="12" mdCols="12"  title="Profession" :value="profile.profession"/>
              <ProfileInfoItem :class="mobile ? 'br bb':'br'" smCols="12" mdCols="6" title="Schools" :value="profile.school.join(', ')"/>
              <ProfileInfoItem :class="mobile ? '':'br'" smCols="12" mdCols="6" title="Skills" :value="profile.education.join(', ')"/>
            </v-row>
          </template>
        </ProfileCard>
      </template>
      <v-col cols="12" :class="mobile ? 'mobile-profile-label headliner':'profile-info-label headliner'">
        contact information
      </v-col>
      <ProfileCard>
        <template v-slot:content>
          <v-row cols="12" class="pt-0" >
            <ProfileInfoItem class="br bb" smCols="6" mdCols="4" title="Phone" :value="profile.phone"/>
            <ProfileInfoItem :class="mobile ? 'bb':'br bb'" smCols="6" mdCols="4" title="Email" :value="profile.email"/>
            <ProfileInfoItem class="bb" smCols="12" mdCols="4" title="Address" :value="profile.address"/>
            <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="4" title="City" :value="profile.city"/>
            <ProfileInfoItem class="br" smCols="6" mdCols="4" title="Country" :value="profile.country"/>
            <ProfileInfoItem smCols="6" mdCols="4" title="Postcode" :value="profile.postCode"/>
          </v-row>
        </template>
      </ProfileCard>
    </v-col>
    <!-- RIGHT SIDE COLUMN -->
    <v-col cols="12" sx="12" md="3" :class="{ 'pt-0 px-5':mobile, 'pt-10 pr-8':myProfile && !mobile, 'pt-12 pr-8':!myProfile }">
      <template v-if="myProfile">
        <v-col v-if="mobile" cols="12" class="mobile-profile-label headliner">
          communities
        </v-col>
        <ProfileCard v-if="myProfile" :title="mobile ? '':'Communities'" class="mt-2">
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
            <router-link v-else to="/discovery">
              <p class="pl-3 caption">Click here to discover your tribes</p>
            </router-link>
          </template>
        </ProfileCard>
      </template>
      <ProfileCard v-if="!myProfile" title="Kaitiaki" class="mt-0 px-0">
        <template v-slot:content>
          <div>
            <v-row  v-for="(kaitiaki, i) in profile.tiaki" :key="i" class="justify-center align-center ma-0 ml-4">
              <v-col cols="2" class="pt-0 pl-0">
                <Avatar :size="mobile ? '50px' : '40px'" :image="kaitiaki.avatarImage" :alt="kaitiaki.preferredName" :aliveInterval="kaitiaki.aliveInterval" :gender="kaitiaki.gender"/>
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
          <v-row v-for="member in tribe.members" :key="member.id" class="justify-center align-center ma-0 ml-4">
            <v-col cols="2" class="pt-0 pl-0">
              <Avatar :size="mobile ? '50px' : '40px'" :image="member.avatarImage" :alt="member.preferredName" />
            </v-col>
            <v-col class="py-0">
              <p style="color:black;">{{ member.preferredName }}</p>
            </v-col>
          </v-row>
        </template>
      </ProfileCard>
    </v-col>
  </v-row>
</template>

<script>
import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import Avatar from '@/components/Avatar.vue'
import { mapGetters, mapActions } from 'vuex'
import { getDisplayName } from '@/lib/person-helpers.js'

export default {
  name: 'Profile',
  components: {
    ProfileInfoCard,
    ProfileCard,
    ProfileInfoItem,
    Avatar
  },
  props: {
    profile: Object,
    tribe: Object
  },
  beforeMount () {
    window.scrollTo(0, 0)
    this.setTribes()
  },
  computed: {
    ...mapGetters(['whoami', 'tribes']),
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
    }
  },
  methods: {
    ...mapActions(['setTribes']),
    goTribe (tribe) {
      var profile = tribe.private.length > 0
        ? tribe.private[0]
        : tribe.public[0]

      return {
        name: profile.type,
        params: { tribeId: tribe.id, profileId: profile.id, profile }
      }
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
