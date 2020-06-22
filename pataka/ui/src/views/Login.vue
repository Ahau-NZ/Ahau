<template>
  <div class="container">
    <v-col class="py-0">
      <h1>Set pub info</h1>
    </v-col>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import pick from 'lodash.pick'

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
  data () {
    return {
      isLoading: true,
      isSetup: false, // has profile set up
      profile: {
        id: null,
        preferredName: null,
        avatarImage: null
      },
      dialog: false
    }
  },
  mounted () {
    this.getCurrentIdentity()
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
        fetchPolicy: 'no-cache'
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
        this.$router.push({ name: 'Dashboard' })
      }

      this.isLoading = false
    },

    async save (profileChanges) {
      const newProfile = pick(profileChanges,
        'preferredName',
        'avatarImage',
        'description'
      )
      const result = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.profile.id,
            ...newProfile
          }
        }
      })

      if (result.errors) {
        console.error('failed to update profile', result)
        return
      }
      this.getCurrentIdentity()
    }
  },
  components: {
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
  min-height: 20vh;
  width: 20vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.name {
  color: white;
}
.body-width {
  max-width: 900px;
}
</style>
