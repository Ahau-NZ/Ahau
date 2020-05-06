<template>
  <div class="wrapper">
    <!-- Header for Profile page only -->
    <Header v-if="this.$route.name === 'profileShow'" :preferredName="selectedProfile.preferredName"
      :headerImage="selectedProfile.headerImage" :avatarImage="selectedProfile.avatarImage" />

    <!-- Profile Container -->
    <v-container :fluid="true" class="body-width white px-6 niho-bg">
      <v-row>
        <!--======== Side Menu ========-->
        <v-col cols="2" style="border: 2px solid red;">
          <!-- Pofile pic -->
          <v-row v-if="this.$route.name === 'profileShow'" class="avatar-row first-row">
            <v-col class="avatar-box">
              <Avatar :image="selectedProfile.avatarImage" :alt="selectedProfile.preferredName" size="200" />
            </v-col>
          </v-row>
          <!-- Nav Icons -->
          <v-row justify="center">
            <!-- if  on profile page show larger avatar above instead of sidemenu avatar image -->
            <SideNavMenu v-if="this.$route.name === 'profileShow'" :profile:="selectedProfile" :noAvatar="true"
              @setPageComponent="setPageComponent($event)"  style="margin-top: 100px; border: 2px solid yellow;"/>
            <SideNavMenu v-else :profile:="selectedProfile" @setPageComponent="setPageComponent($event)" />
          </v-row>
        </v-col>

        <!--======== Main content ========-->
        <v-col cols="10" style="border: 2px solid blue;">
          <Profile v-if="pageComponents.profile" :profile="selectedProfile" :type="'person'"/>
          <Archive v-if="pageComponents.archive" :profile="selectedProfile"/>
          <StoryTimeline v-if="pageComponents.timeline" :profile="selectedProfile"/>
        </v-col>

      </v-row>
    </v-container>

    <!-- <SideNav v-if="!mobile" :profile="selectedProfile"  /> -->
    <!-- TODO: get profile from store instead of graphql. make sure dialog update updates profile page. -->
    <DialogHandler 
      :dialog.sync="dialog.active" 
      :selectedProfile="selectedProfile"
      @setupProfile="setupProfile($event)" 
    />
  </div>
</template>

<script>
  import DialogHandler from '@/components/dialog/DialogHandler.vue'
  import Header from '@/components/profile/Header.vue'
  import Avatar from '@/components/Avatar.vue'
  import SideNavMenu from '@/components/SideNavMenu.vue'
  
  import Profile from '@/components/Profile'
  import Archive from '@/components/Archive'
  import StoryTimeline from '@/components/StoryTimeline'


  import {
    getProfile
  } from '@/lib/profile-helpers'
  import {
    mapActions,
    mapGetters
  } from 'vuex'

  const NULL_PAGE_COMPONENTS = {
    profile: null,
    archive: null,
    storyTimeline: null,
  }

  export default {
    name: 'ProfileShow',
    components: {
      DialogHandler,
      Header,
      Avatar,
      SideNavMenu,
      Profile,
      Archive,
      StoryTimeline,
    },
    data() {
      return {
        dialog: {
          active: null,
          type: null
        },
        pageComponents: {
          profile: true,
          archive: false,
          storyTimeline: false,
        },
      }
    },
    mounted() {
      this.setupProfile(this.$route.params.id)
    },
    computed: {
      ...mapGetters(['selectedProfile', 'whoami'])
    },

    methods: {
      setPageComponent(component) {
        //set all to false
        this.pageComponents = NULL_PAGE_COMPONENTS;

        switch (component) {
          case "profile":
            this.pageComponents.profile = true;
            break;
          case "archive":
            this.pageComponents.archive = true;
            break;
          case "timeline":
            this.pageComponents.timeline = true;
            break;
          default:
            this.pageComponents.profile = true;
        }
      },
      ...mapActions(['setProfile', 'setWhoami']),

      async setupProfile(id) {
        const result = await this.$apollo.query(getProfile(id))
        if (result.errors) {
          console.error('Failed to get profile in ProfileShow')
          console.error(result.errors)
          return
        } else {
          if (result.data.person) this.setProfile(result.data.person)
        }
        if (this.dialog.active) this.dialog.active = null
        if (id === this.whoami.profile.id) await this.setWhoami()
      },

      updateDialog(dialogObj) {
        this.dialog.type = dialogObj.type
        this.dialog.active = dialogObj.dialog
      }
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

  $avatarSize: 25vh;
  $ratio: 5.33333;
  $headerHeight: 100vw / $ratio;
  $maxHeaderWidth: 1400px;
  $formWidth: 600px;

  * {
    color: black;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center; // background: linear-gradient(to right, grey 0%,grey 50%,#000000 50%,white 50%,white 100%);

    .body-width {
      min-width: $formWidth;
      max-width: 100vw;
      min-height: 100vh;
      background: white;
    }

    .niho-bg {
      background: linear-gradient(rgba(255, 255, 255, 0.7),
          rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
      background-position-x: 150%;
      background-repeat: no-repeat;

    }

    .avatar-row {
      position: relative;
      width: 100%;
      /* height: 20%; */
      margin: auto;

      .avatar-box {
        position: absolute;
        /* left: calc(-100vw / 3 + 3 * #{$avatarSize}); */
        top: -$avatarSize/1.5;
        width: 100%;
      }
    }
  }
</style>