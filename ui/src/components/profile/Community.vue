<template>
    <v-row class="mb-12" :class="mobile ? 'mt-10':''">
      <v-col cols="12" sx="12" sm="12" md="9" :class="mobile ? 'py-5 px-5' : 'px-5 py-0' " style="margin-top: -8px;">
        <ProfileCard>
          <template v-slot:content>
            <ProfileInfoItem title="About" smCols="12" mdCols="12" :value="profile.description"/>
          </template>
        </ProfileCard>
        <ProfileCard>
          <template v-slot:content>
            <v-row cols="12" class="pt-0" >
              <ProfileInfoItem class="br" smCols="12" mdCols="3" title="Phone" :value="profile.phone"/>
              <ProfileInfoItem class="br" smCols="12" mdCols="3" title="Email" :value="profile.email"/>
              <ProfileInfoItem class="br" smCols="12" mdCols="3" title="Address" :value="profile.address"/>
              <ProfileInfoItem smCols="12" mdCols="3" title="Location" :value="profile.location"/>
            </v-row>
          </template>
        </ProfileCard>
      </v-col>
      <!-- RIGHT SIDE COLUMN -->
      <v-col cols="12" sx="12" md="3" :class="mobile ? 'py-5 px-5' : 'pr-8'">
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
        <ProfileCard title="Whānau" class="mt-3">
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
        <!-- <Kaitiaki
          class="mt-3"
          title="Communities"
          subtitle="These are the communities connected to this profile"
          :profiles="profile.tiaki"
        /> -->
      </v-col>
    </v-row>
</template>

<script>
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import { mapGetters } from 'vuex'
import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'Profile',
  components: {
    ProfileCard,
    ProfileInfoItem,
    Avatar
  },
  props: {
    profile: {
      type: Object,
      default: () => ({})
    },
    editProfile: {
      type: Function
      // default: () => console.log('need to define editProfile!')
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
    },
    headerHeight () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return '150px'
        case 'sm': return '150px'
        case 'md': return '250px'
        case 'lg': return '250px'
        case 'xl': return '250px'
        default:
          return '250px'
      }
    }
  },
  methods: {
    splitParagraphs (text) {
      if (!text) return
      return text.split('\n\n')
    },
    getComponent () {
      // isMobile would be some check to determine the validity of that, how ever you check for that
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 'ProfileShowMobile'
        case 'sm':
        case 'md':
        case 'lg':
        case 'xl':
          return 'ProfileShowDesktop'
      }
    },
    age (born) {
      var age = calculateAge(born)
      if (age == null) {
        return 'age not entered'
      }
      return age
    },
    formatDob (born) {
      var formattedDate = formatDate(born)
      if (formattedDate == null) {
        return 'no dob'
      }
      return formattedDate
    }
  }
}
</script>
<style lang="scss">
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
  border-right: 0.5px solid rgba(0,0,0,0.12);
  }

</style>
