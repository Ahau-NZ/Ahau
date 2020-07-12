<template>
    <v-row class="mb-12" :class="mobile ? 'mobile-profile':''">
      <v-col cols="12" md="9" :class="mobile ? 'pt-7 pb-5 px-5' : 'px-5' ">
        <!-- <RegisterButton v-if="profile.type === 'community'" :class="!mobile ? 'margin-top':''"/> -->
        <ProfileInfoCard :profile="profile" @setupProfile="setupProfile($event)" />
        <!-- <ProfileCard>
          <template v-slot:content>
            <ProfileInfoItem title="About" smCols="12" mdCols="12" :value="profile.description"/>
          </template>
        </ProfileCard> -->
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
        <!-- TODO: update profiles to profiles.tiaki -->
        <ProfileCard title="Kaitiaki" class="mt-0">
          <template v-slot:content>
            <v-row class="justify-center align-center ma-0">
              <v-col cols="2" class="pt-0 pl-0">
                <Avatar :size="mobile ? '50px' : '40px'" :image="whoami.profile.avatarImage" :alt="whoami.profile.preferredName" />
              </v-col>
              <v-col>
                <p style="color:black;">{{whoami.profile.preferredName}}</p>
              </v-col>
            </v-row>
          </template>
        </ProfileCard>
        <ProfileCard v-if="profile.type === 'person'" title="Communities" class="mt-3">
          <template v-slot:content>
            <v-row class="justify-center align-center ma-0">
              <v-col cols="2" class="pt-0 pl-0">
                <Avatar :size="mobile ? '50px' : '40px'" :image="whoami.profile.avatarImage" :alt="whoami.profile.preferredName" />
              </v-col>
              <v-col>
                <p style="color:black;">{{whoami.profile.preferredName}}</p>
              </v-col>
            </v-row>
          </template>
        </ProfileCard>
        <ProfileCard v-else title="Members" class="mt-3">
          <template v-slot:content>
            <v-row class="justify-center align-center ma-0">
              <v-col cols="2" class="pt-0 pl-0">
                <Avatar :size="mobile ? '50px' : '40px'" :image="whoami.profile.avatarImage" :alt="whoami.profile.preferredName" />
              </v-col>
              <v-col>
                <p style="color:black;">{{whoami.profile.preferredName}}</p>
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
import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'
import Avatar from '@/components/Avatar.vue'
import { mapGetters } from 'vuex'
// import RegisterButton from '@/components/button/RegisterButton.vue'

export default {
  name: 'Profile',
  components: {
    ProfileInfoCard,
    ProfileCard,
    ProfileInfoItem,
    Avatar
    // RegisterButton
  },
  props: {
    profile: {
      type: Object,
      default: () => ({})
    },
    editProfile: {
      type: Function
    },
    setupProfile: Function
  },
  data () {
    return {
      isEditing: false
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
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

  // .margin-top {
  //   margin-top: -75px
  // }

</style>
