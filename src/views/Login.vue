<template>
  <div class="container">
    <div v-if='isSplash' class='image-container'>
      <img src='@/assets/logo_red.svg' />
      <h1>Āhau</h1>
    </div>

    <v-btn v-if="!isSplash && !isSetup"
      text x-large color="#b12526"
      :to="{ name: 'personEdit', params: { id: profile.id }, query: { setup: true } }"
      >
      <v-icon left>mdi-plus</v-icon>
      Create profile
    </v-btn>

    <router-link v-if="!isSplash && isSetup"
      :to="{ name: 'whakapapaIndex' }"
      class="d-flex flex-column align-center">
      <Avatar :image="profile.avatarImage" :gender="profile.gender" :bornAt="profile.bornAt" size="13vh" />
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
      isSetup: true, // has profile set up
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
    if (process.env.NODE_ENV === 'development') {
      this.$router.push({ name: 'whakapapaIndex' })
      return
    }
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

      this.isSetup = this.profile.preferredName
      this.isSplash = false
    }
  },
  components: {
    Avatar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  h1 {
    text-transform: uppercase;
    letter-spacing: 0.5vw;
    text-align: center;
    padding-top: 15%;
  }
  .container {
    width: 100%;
    height: 90%;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image-container {
    height: 20vh;
    width: 20vh;
  }
  .name {
    color: white;
  }
  .body-width {
    max-width: 900px;
  }
</style>
