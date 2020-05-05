<template>
  <div>
    <!-- Pofile pic -->
    <v-row v-if="!noAvatar" class="avatar-row">
      <v-col class="pa-0">
        <v-row class="avatar-box pa-0" justify="center" align="center">
          <Avatar :image="profile.avatarImage" :alt="profile.preferredName" size="15vh" />
        </v-row>
        <v-row justify="center" align="center">
          <h1 class="primary--text">{{ profile.preferredName }}</h1>
        </v-row>
      </v-col>
    </v-row>
    <!-- Nav Icons -->
    <v-row>
      <v-col class="pl-8">
          <!-- TODO: somethings up passing id as router paramter. dont like that using graphql in sidemenu. but profile prop not givind id for some reason? -->
        <router-link :to="{ name: 'archive', params: { id: getID() }  }">
          <v-row justify="start" align="center" class="nav-row">
            <img class="nav-icon" v-bind:src="require('@/assets/archive-red.svg')" />
            <span class="ml-4 black--text nav-label subtitle-1">Archive</span>
          </v-row>
        </router-link>
        <router-link :to="{ name: 'story', params: { id: getID() }  }">
          <v-row justify="start" align="center" class="nav-row">
            <img class="nav-icon" v-bind:src="require('@/assets/timeline.svg')" />
            <span class="ml-4 black--text nav-label subtitle-1">Story</span>
          </v-row>
        </router-link>
        <v-row justify="start" align="center" class="nav-row">
          <img class="nav-icon" v-bind:src="require('@/assets/tree.svg')" />
          <span class="ml-4 black--text nav-label subtitle-1">Whakapapa</span>
        </v-row>
        <v-row justify="start" align="center" class="nav-row">
          <img class="nav-icon" v-bind:src="require('@/assets/activity.svg')" />
          <span class="ml-4 black--text nav-label subtitle-1">Activity</span>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import gql from 'graphql-tag'

  import Avatar from '@/components/Avatar.vue'

  export default {
    name: 'SideNavMenu',
    props: {
      editProfile: {
        type: Function
        // default: () => console.log('need to define editProfile!')
      },
      noAvatar: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        profile: {
          id: null,
          avatarImage: null
        }
      }
    },
    beforeMount() {
      this.getCurrentIdentity()
    },
    mounted() {
      console.log("from sidemenu nav: ", this.profile)
    },
    methods: {
      getID() {
        console.log("sidemenu got id: ", this.profile.id)  
        return this.profile.id
      },
      async getCurrentIdentity() {
        const result = await this.$apollo.query({
          query: gql `
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

        this.profile = result.data.whoami.profile
      },
    },
    components: {
      Avatar,
    }
  }
</script>

<style lang="scss" scoped>
  .nav-row {
    margin: 20px;
  }

  .nav-icon {
    width: 30px;
  }

  .nav-label {
    // font-size: 1.2em;
  }
</style>