<template>
    <v-row>
      <v-col cols="12" sx="12" sm="12" md="10" :class="mobile ? 'py-5' : '' ">
        <ProfileInfoCard :profile="profile" @setupProfile="setupProfile($event)" />
        <ProfileCard title="About">
          <template v-slot:content>
            <p style="color: lightgrey; text-align: center;">TODO</p>
          </template>
        </ProfileCard>
        <ProfileCard title="Contact">
          <template v-slot:content>
            <v-row cols="12" class="pt-0">
              <ProfileInfoItem smCols="12" mdCols="4" title="Phone" :value="profile.phone"/>
              <ProfileInfoItem smCols="12" mdCols="4" title="Email" :value="profile.email"/>
              <ProfileInfoItem smCols="12" mdCols="4" title="Address" :value="profile.address"/>
            </v-row>
          </template>
        </ProfileCard>
      </v-col>
      <!-- RIGHT SIDE COLUMN -->
      <v-col cols="12" sx="12" md="2" :class="mobile ? 'py-5' : 'pr-5'">
        <Kaitiaki
          title="Kaitiaki"
          subtitle="These are the people who have administrative rights on this profile"
          :profiles="profile.tiaki"
        />
        <Kaitiaki
          class="mt-3"
          title="Communities"
          subtitle="These are the communities connected to this profile"
          :profiles="profile.tiaki"
        />
      </v-col>
    </v-row>
</template>

<script>
import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import Kaitiaki from '@/components/profile/Kaitiaki.vue'

import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'

export default {
  name: 'Profile',
  components: {
    ProfileInfoCard,
    ProfileCard,
    Kaitiaki,
    ProfileInfoItem
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
    },
    updateDialog (dialog) {
      this.$emit('setDialog', dialog)
    }
  }
}
</script>
<style lang="scss">
  .rounded-card {
    border-radius: 10px;
    p {
      font-size: 0.8em;
      line-height: 1.6;
      color: #383838
    }
  }

  .first-row {
    height: 70px;
  }

  .nav-icon {
    width: 30px;
  }
</style>
