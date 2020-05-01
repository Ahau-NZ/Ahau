<template>
    <component :is="getComponent()" :profile="profile"></component>
</template>

<script>
  import ProfileShowDesktop from '@/components/ProfileShowDesktop.vue'
  import ProfileShowTablet from '@/components/ProfileShowTablet.vue'
  import ProfileShowMobile from '@/components/ProfileShowMobile.vue'

  export default {
    name: 'ProfileShow',
    props: {
      type: {
        type: String, // person / community?
        required: true
      },
      profile: {
        type: Object,
        default: () => ({})
      },
      editProfile: {
        type: Function
        // default: () => console.log('need to define editProfile!')
      }
    },
    methods: {
      splitParagraphs(text) {
        if (!text) return

        return text.split('\n\n')
      },
      
      getComponent() {
        // isMobile would be some check to determine the validity of that, how ever you check for that 
        switch (this.$vuetify.breakpoint.name) {
          case 'xs': return 'ProfileShowMobile'
          case 'sm':
          case 'md': return 'ProfileShowTablet'
          case 'lg':
          case 'xl': return 'ProfileShowDesktop'
        }
      },
    },
    components: {
      ProfileShowDesktop,
      ProfileShowTablet,
      ProfileShowMobile
    }
  }
</script>
<style scoped lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;

    .niho-bg {
      background: linear-gradient(rgba(255, 255, 255, 0.7),
          rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
      background-position-x: 150%;
      background-repeat: no-repeat;

    }
  }
</style>