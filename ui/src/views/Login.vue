<template>
  <div class="container">
    <div v-if="isLoading" class="splash">
      <img src="@/assets/logo_red.svg" />
      <h1>Āhau</h1>
    </div>

    <v-btn
      v-if="!isLoading && !isSetup"
      text
      x-large
      color="#b12526"
      :to="{
        name: 'personEdit',
        params: { id: profile.id },
        query: { setup: true }
      }"
    >
      <!-- TODO change this for an EditProfile dialog -->
      <v-icon left>mdi-plus</v-icon>
      Create profile
    </v-btn>

    <router-link
      v-if="!isLoading && isSetup"
      :to="{ name: 'whakapapaIndex' }"
      class="d-flex flex-column align-center"
      @click.native="karakiaTūwhera()"
    >
      <Avatar
        :image="profile.avatarImage"
        :gender="profile.gender"
        :bornAt="profile.bornAt"
        size="13vh"
      />
      <h3 class="name mt-2">{{ profile.preferredName }}</h3>
    </router-link>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'

const karakia = `
---------------------------------
E te tangata
Whāia te māutauranga kai mārama
Kia whai take ngā mahi katoa
Tū māia, tū kaha
Aroha atu, aroha mai 
Tātou i a tātou katoa

For this person
Seek knowledge for understanding
Have purpose in all that you do
Stand tall, be strong
Lets us all show respect
For each other
---------------------------------
`

export default {
  props: {
    mobileServerLoaded: { type: Boolean, default: false }
  },
  data () {
    return {
      isLoading: true,
      isSetup: false, // has profile set up
      profile: {
        id: null,
        preferredName: null,
        avatarImage: null
      }
    }
  },
  watch: {
    mobileServerLoaded: {
      handler (nextValue) {
        if (nextValue && process.env.VUE_APP_PLATFORM === 'cordova') {
          this.getCurrentIdentity()
        }
      },
      immediate: true
    }
  },
  mounted () {
    if (process.env.VUE_APP_PLATFORM !== 'cordova') {
      this.getCurrentIdentity()
    }
  },
  methods: {
    async getCurrentIdentity () {
      const result = await this.$apollo.query({
        query: gql`
          {
            whoami {
              profile {
                id
                preferredName
                avatarImage {
                  uri
                }
              }
            }
          }
        `,
        fetchPolicy: 'nocache'
      })

      if (result.errors) throw result.errors

      if (result.data.whoami.profile) this.profile = result.data.whoami.profile

      this.proceed()
    },

    karakiaTūwhera () {
      console.log(karakia)
    },

    proceed () {
      if (this.$apollo.loading || !this.profile.id) {
        console.log('waiting for apollo')
        setTimeout(this.proceed, 300)
        return
      }

      this.isSetup = Boolean(this.profile.preferredName)

      // Shortcut in dev, that saves us from doing one click when testing
      if (this.isSetup && process.env.NODE_ENV === 'development') {
        this.karakiaTūwhera()
        this.$router.push({ name: 'whakapapaIndex' })
      }

      this.isLoading = false
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

.splash {
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
