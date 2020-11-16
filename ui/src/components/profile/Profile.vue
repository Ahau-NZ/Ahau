<template>
  <v-row class="mb-12" :class="mobile ? 'mobile-profile':''">
    <v-col cols="12" md="9" :class="mobile ? 'pt-7 pb-5 px-5' : 'px-5' ">
      <ProfileInfoCard :profile="profile" @setupProfile="setupProfile($event)"/>
      <ProfileCard>
        <template v-slot:content>
          <v-row cols="12" class="pt-0" >
            <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="4" title="Phone" :value="profile.phone"/>
            <ProfileInfoItem :class="mobile ? 'bb':'br'" smCols="12" mdCols="4" title="Email" :value="profile.email"/>
            <ProfileInfoItem smCols="12" mdCols="4" title="Address" :value="profile.address"/>
          </v-row>
        </template>
      </ProfileCard>
    </v-col>
    <!-- RIGHT SIDE COLUMN -->
    <v-col cols="12" sx="12" md="3" :class="mobile ? 'pt-0 px-5' : 'pr-8'">
      <ProfileCard title="Kaitiaki" class="mt-0 px-0">
        <template v-slot:content>
          <div>
            <v-row  v-for="(kaitiaki, i) in profile.tiaki" :key="i" class="justify-center align-center ma-0 ml-4">
              <v-col cols="2" class="pt-0 pl-0">
                <Avatar :size="mobile ? '50px' : '40px'" :image="kaitiaki.avatarImage" :alt="kaitiaki.preferredName" :aliveInterval="kaitiaki.aliveInterval"/>
                <!-- <Avatar v-else :size="mobile ? '50px' : '40px'" isView /> -->
              </v-col>
              <v-col  class="py-0">
                <p style="color:black;">{{ kaitiaki.preferredName }}</p>
              </v-col>
            </v-row>
          </div>
        </template>
      </ProfileCard>
      <!-- TODO: these can be extended to show communities in common with currentProfile  -->
      <ProfileCard v-if="profile.id === whoami.personal.profile.id" title="Communities" class="mt-2">
        <template v-slot:content>
          <div v-if="connectedTribes.length > 0">
            <v-row v-for="tribe in connectedTribes" :key="tribe.id" class="justify-center align-center ma-0 ml-4">
              <v-col cols="2" class="pt-0 pl-0">
                <router-link :to="goTribe(tribe)">
                  <Avatar :size="mobile ? '50px' : '40px'" :image="tribe.private[0].avatarImage" :alt="tribe.private[0].preferredName" :isView="!tribe.private[0].avatarImage" clickable/>
                </router-link>
              </v-col>
              <v-col class="py-0">
                <p style="color:black;">{{ tribe.private[0].preferredName }}</p>
              </v-col>
            </v-row>
          </div>
          <router-link v-else to="/discovery">
            <p class="pl-3 caption">Click here to discover your tribes</p>
          </router-link>
        </template>
      </ProfileCard>
      <ProfileCard v-if="profile.type === 'community' && !nonMember" title="Members">
        <template v-slot:content>
          <v-row v-for="member in currentTribe.members" :key="member.id" class="justify-center align-center ma-0 ml-4">
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
import mapProfileMixins from '@/mixins/profile-mixins.js'

export default {
  name: 'Profile',
  components: {
    ProfileInfoCard,
    ProfileCard,
    ProfileInfoItem,
    Avatar
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  data () {
    return {
      profile: {
        type: 'community'
      }
    }
  },
  beforeMount () {
    window.scrollTo(0, 0)
    this.setTribes()
  },
  computed: {
    ...mapGetters(['whoami', 'currentTribe', 'tribes']),
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
    ...mapActions(['setProfileById', 'setDialog', 'setCurrentTribe', 'setTribes']),
    goTribe (tribe) {
      console.log(tribe)
      return {
        name: 'person',
        params: { tribeId: tribe.id, profileId: tribe.private[0].id }
      }
    }
  }
}
</script>
<style lang="scss">
  .mobile-profile {
    position: absolute;
    top: 390px;
    max-width: 99.5%;
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

</style>
