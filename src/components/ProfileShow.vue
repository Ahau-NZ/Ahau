<template>
  <div class='wrapper'>
    <Header :preferredName="profile.preferredName" :headerImage="profile.headerImage" :avatarImage="profile.avatarImage"/>
    <v-container class="body-width white py-12 px-12">
      <v-row>
        <v-col cols="8">
          <h1 class="primary--text">{{profile.preferredName}}</h1>
          <v-row>
            <v-col v-if="profile.legalName" cols="6">
              <h3 class="primary--text caption">Legal name</h3>
              <p class="primary--text body-1">{{profile.legalName}}</p>
            </v-col>
            <!-- <v-col cols="6"> -->
            <!--   <h3 class="primary--text caption">Other names</h3> -->
            <!--   <p class="primary--text body-1">{{altNames}}</p> -->
            <!-- </v-col> -->
          </v-row>
        </v-col>

        <v-col cols="4" class="d-flex justify-end">
          <v-btn v-if="profile.canEdit" class="my-2" fab color="white" @click="editProfile()">
            <v-icon class="black--text">mdi-pencil</v-icon>
          </v-btn>
          <span class="ml-4 subtitle">Edit</span>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="8">
          <v-card light min-height="200px" >
            <v-card-title class="headline font-weight-bold">About</v-card-title>
            <v-card-text>
              <p v-for="(p, i) in splitParagraphs(profile.description)" :key="i + p">
                {{p}}
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="4">
          <!-- TODO perhaps this should be a different component? -->
          <v-card v-if="type === 'community'" light outlined min-height="200px">
            <v-card-title class="headline">Kaitiaki</v-card-title>
            <v-btn text v-for="t in profile.tiaki" :key="t.id"
              :to="{ name: 'personShow', params: { id: t.id } }">
              {{ t.preferredName }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- <v-row> -->
        <!-- <v-card min-height="200px" light > -->
        <!--   <v-card-title class="headline">Communities</v-card-title> -->
        <!-- </v-card> -->
      <!-- </v-row> -->
    </v-container>
  </div>
</template>

<script>
import Header from '@/components/profile/Header.vue'

// const get = require('lodash.get')

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
    splitParagraphs (text) {
      if (!text) return

      return text.split('\n\n')
    }
  },
  components: {
    Header
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    // background: linear-gradient(to right, grey 0%,grey 50%,#000000 50%,white 50%,white 100%);

    .body-width {
      min-width: 600px;
      max-width: 60vw;
      min-height: calc(100vh - 40vh);
      background: white;
    }
  }
</style>
