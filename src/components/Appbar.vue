<template>
    <div>
    <v-toolbar>
      <v-toolbar-title class="d-flex align-center">
        <router-link to="/">
          <img src="../assets/logo_red.svg" />
        </router-link>
        <!-- <v-btn icon :to="{ name: 'personShow', params: { id: profile.id } }"> -->
          <Avatar size="50px" :image="profile.avatarImage" :alt="profile.preferredName" :gender="profile.gender" :bornAt="profile.bornAt"/>
        <!-- </v-btn> -->
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text to='/whakapapa' class="white--text text-uppercase">
          whakapapa
        </v-btn>
        <!-- <v-btn text to='/discovery?page=local' class="white--text text-uppercase">
          discover
        </v-btn>
        <v-btn text :to="{ name: 'personShow', params: { id: profile.id } }" class="white--text text-uppercase">
          profile
        </v-btn> -->
        <v-btn text to="/logout" class="white--text text-uppercase">
          sign out
        </v-btn>

      </v-toolbar-items>
    </v-toolbar>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'

export default {
  name: 'Appbar',
  data () {
    return {
      profile: {
        id: null,
        avatarImage: null
      }
    }
  },
  beforeMount () {
    this.getCurrentIdentity()
  },
  methods: {
    async getCurrentIdentity () {
      const result = await this.$apollo.query({
        query: gql` {
          whoami {
            profile {
              id
              preferredName
              avatarImage {
                uri
              }
            }
          }
        }`,
        fetchPolicy: 'no-cache'
      })

      if (result.errors) throw result.errors

      this.profile = result.data.whoami.profile
    }
  },
  watch: {
    $route (next, last) {
      if (last.name === 'personEdit' && last.params.id === this.profile.id) {
        this.getCurrentIdentity()
      }
    }
  },
  components: {
    Avatar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  img {
    height: 45px;
    padding: 0 25px;
  }
</style>
