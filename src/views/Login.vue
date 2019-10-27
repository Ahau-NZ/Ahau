<template>
  <div class="container">
    <div v-if='isSplash' class='image-container'>
      <img src='@/assets/logo_red.svg' />
    </div>
    <router-link v-else :to="{ name: 'communityIndex' }" class="d-flex flex-column align-center">
      <Avatar :image="profile.avatarImage" size="13vh" />
      <h3 class="name mt-2">{{ profile.preferredName }}</h3>
    </router-link>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'

export default {
  data () {
    return {
      isSplash: true,
      profile: {
        id: null,
        preferredName: null,
        avatarImage: null
      }
    }
  },
  apollo: {
    profile: {
      query: gql` {
        whoami {
          profile {
            id,
            preferredName,
            avatarImage {
              uri
            }
          }
        }
      }`,
      update (data) {
        return data.whoami.profile
      },
      fetchPolicy: 'no-cache'
    }
  },
  mounted () {
    setTimeout(this.proceed, 2e3)
  },
  methods: {
    proceed () {
      if (this.$apollo.loading) {
        console.log('$apollo.loading')
        return setTimeout(this.proceed, 500)
      }

      if (!this.profile.id) {
        console.log('waiting for apollo!')
        return setTimeout(this.proceed, 500)
      }

      if (!this.profile.preferredName) {
        this.$router.push({
          name: 'profileEdit',
          params: { id: this.profile.id },
          query: { setup: true }
        })
      } else this.isSplash = false
    }
  },
  components: {
    Avatar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .container {
    width: 100%;
    height: 90%;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image-container {
    height: 40vh;
    width: 40vh;
  }
  .name {
    color: white;
  }
  .body-width {
    max-width: 900px;
  }
</style>
