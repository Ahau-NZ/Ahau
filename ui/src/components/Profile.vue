<template>
  <div>
    <ProfileInfoCard :profile="profile" />
  </div>
</template>

<script>
import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'

import calculateAge from '@/lib/calculate-age'
import formatDate from '@/lib/format-date'

export default {
  name: 'Profile',
  props: {
    profile: {
      type: Object,
      default: () => ({})
    },
    editProfile: {
      type: Function
      // default: () => console.log('need to define editProfile!')
    }
  },
  data () {
    return {
      isEditing: false
    }
  },
  computed: {
    mobile: function () {
      console.log('mobile = ', this.$vuetify.breakpoint.xsOnly)
      return this.$vuetify.breakpoint.xsOnly
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
    },
    openProfile (profile) {
      this.$emit('setupProfile', profile.id)
    }
  },
  components: {
    ProfileInfoCard
  }
}
</script>
<style scoped lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

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
