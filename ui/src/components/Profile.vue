<template>
  <div :class="['wrapper', mobile ? '' : 'top-padding']">
    <Header
      :profile="profile"
      @setupProfile="setupProfile($event)"
    />

      <v-container fluid class="body-width white pa-5 niho-bg">
      <v-row>
       <v-col cols="12" offset-md="2" md="8" sm="12" :class="!mobile ? 'pl-12' : '' " class="py-0" :align="mobile ? 'center' : 'start'">
          <h1 class="primary--text" >{{ profile.legalName ? profile.legalName : profile.preferredName }}</h1>
        </v-col>
        <v-col :order="mobile ? 'first' : 'last'" :align="mobile ? 'end' : 'center'" cols="12" md="2" sm="12"  class="py-0">
         <v-tooltip left>
            <template v-slot:activator="{ on }">
                <v-btn v-on="on" x-small class="my-2" fab color="white" @click="updateDialog('edit-node')">
                  <v-icon small class="black--text">mdi-pencil</v-icon>
                </v-btn>
            </template>
            <span>Edit profile</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row class="content-top-margin">
        <!-- LEFT SIDE COLUMN -->
        <v-col cols="12" xs="12" sm="12" md="2">
          <slot name="nav"></slot>
        </v-col>
        <!-- MIDDLE COLUMN -->
        <v-col cols="12" sx="12" sm="12" md="8">
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
        <v-col cols="12" sx="12" sm="12" md="2" :class="mobile ? 'pl-0 pr-0' : ''">
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
    </v-container>
  </div>
</template>

<script>
import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'
import ProfileInfoItem from '@/components/profile/ProfileInfoItem.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import Header from '@/components/profile/Header.vue'
import Kaitiaki from '@/components/profile/Kaitiaki.vue'

import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'

export default {
  name: 'Profile',
  components: {
    Header,
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
<style scoped lang="scss">
  .rounded-card {
    border-radius: 10px;
    p {
      font-size: 0.8em;
      line-height: 1.6;
    }
  }

  .first-row {
    height: 70px;
  }

  .nav-icon {
    width: 30px;
  }
</style>
