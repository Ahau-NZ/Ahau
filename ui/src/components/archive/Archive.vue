<template>
<div>
  <v-container fluid class="body-width white niho-bg">
      <v-row :class="mobile ? 'my-0':'mt-10'">
        <v-col cols="12" md="10" sm="10" :class="!mobile ? 'pl-12 my-6' : 'pa-0 ma-0'" align="start">
          <h1 class="title black--text ">Collections</h1>
        </v-col>
        <div>
          <!-- <v-btn :class="mobile ? 'searchBtnMob' : 'searchBtn'" :small="!mobile" :x-small="mobile" class="my-2" fab flat color="white" @click="editProfile()">
            <v-icon small class="black--text">mdi-magnify</v-icon>
          </v-btn>            -->
          <v-btn :large="!mobile" :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab color="white" @click.stop="openContextMenu($event)">
            <v-icon class="black--text">mdi-plus</v-icon>
          </v-btn>
        </div>
      </v-row>
      <v-row>
        <v-col cols="12" xs="12" sm="12" md="10">
          <v-row class="mx-0">
            <CollectionGroup :collections="mockCollections" />
          </v-row>
          <v-divider class="mt-6 mb-8" light></v-divider>
          <v-row justify="center">
            <ArchiveStory />
          </v-row>
          <v-row justify="center">
            <ArchiveStory />
          </v-row>
          <v-row justify="center">
            <ArchiveStory />
          </v-row>
          <v-row justify="center">
            <ArchiveStory />
          </v-row>
      </v-col>
    </v-row>
  </v-container>
  <vue-context ref="menu" class="pa-4">
    <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a href="#" @click.prevent="updateDialog(option.dialog)" class="d-flex align-center px-4">
            <v-icon light>{{ option.icon }}</v-icon>
            <p class="ma-0 pl-3">{{ option.title }}</p>
        </a>
    </li>
  </vue-context>

  <DialogHandler
      :dialog.sync="dialog.active"
      :type.sync="dialog.type"
  />
  </div>
</template>

<script>
import {
  VueContext
} from 'vue-context'

import ArchiveStory from '@/components/archive/ArchiveStory.vue'
import CollectionGroup from '@/components/archive/CollectionGroup.vue'

import DialogHandler from '@/components/dialog/DialogHandler.vue'

// const get = require('lodash.get')

export default {
  name: 'ArchiveShow',
  data () {
    return {
      mockCollections: [
        {
          image: require('@/assets/mock3.jpg'),
          title: 'Private Records',
          description: 'Private records that I want to remember',
          stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
          lastSubmissionDate: new Date(),
          hasAccess: [{
            id: 123,
            preferredName: 'Ian'
            // avatarImage: require('@/assets/koro.svg')
          },
          {
            id: 456,
            preferredName: 'Ben'
            // avatarImage: require('@/assets/kuia.svg')
          }
          ]
        },
        {
          image: require('@/assets/mock3.jpg'),
          title: 'Private Records',
          description: 'Private records that I want to remember',
          stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
          lastSubmissionDate: new Date(),
          hasAccess: [{
            id: 123,
            preferredName: 'Ian'
            // avatarImage: require('@/assets/koro.svg')
          },
          {
            id: 456,
            preferredName: 'Ben'
            // avatarImage: require('@/assets/kuia.svg')
          }]
        },
        {
          image: require('@/assets/mock3.jpg'),
          title: 'Private Records',
          description: 'Private records that I want to remember',
          stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
          lastSubmissionDate: new Date(),
          hasAccess: [{
            id: 123,
            preferredName: 'Ian',
            avatarImage: { uri: require('@/assets/koro.svg') }
          },
          {
            id: 456,
            preferredName: 'Ben',
            avatarImage: { uri: require('@/assets/kuia.svg') }
          }]
        },
        {
          image: require('@/assets/mock3.jpg'),
          title: 'Private Records',
          description: 'Private records that I want to remember',
          stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
          lastSubmissionDate: new Date(),
          hasAccess: [{
            id: 123,
            preferredName: 'Ian',
            avatarImage: { uri: require('@/assets/koro.svg') }
          },
          {
            id: 456,
            preferredName: 'Ben',
            avatarImage: { uri: require('@/assets/kuia.svg') }
          }]
        },
        {
          image: require('@/assets/mock3.jpg'),
          title: 'Private Records',
          description: 'Private records that I want to remember',
          stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
          lastSubmissionDate: new Date(),
          hasAccess: [{
            id: 123,
            preferredName: 'Ian',
            avatarImage: { uri: require('@/assets/koro.svg') }
          },
          {
            id: 456,
            preferredName: 'Ben',
            avatarImage: { uri: require('@/assets/kuia.svg') }
          }]
        }
      ],
      dialog: {
        active: null,
        type: null
      },
      contextMenuOpts: [{
        title: 'Create a new Collection',
        dialog: 'new-collection',
        icon: 'mdi-folder-multiple-outline'
      },
      {
        title: 'Create a new Record',
        dialog: 'new-record',
        icon: 'mdi-file-outline'
      }
      ]

    }
  },
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
  computed: {
    classObj () {
      if (mobile) {
        return {

        }
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    openContextMenu (event) {
      if (this.dialog.view) {
        this.toggleView()
      }
      this.$refs.menu.open(event)
    },
    toggleView () {
      this.dialog.view = !this.dialog.view
    },
    updateDialog (dialog) {
      this.dialog.active = dialog
    }
  },
  components: {
    ArchiveStory,
    CollectionGroup,
    VueContext,
    DialogHandler
  }
}
</script>

<style lang="scss" scoped>
@import "~vue-context/dist/css/vue-context.css";

.overflow {
    width: 100vw;
    overflow-y: scroll;
    -ms-overflow-style: none;
}
/* this hides overflow scrollbar */
.overflow::-webkit-scrollbar {
  display: none;
}

.overflow-x {
  width:'100vw';
  height:200px;
  overflow-y:scroll;
}

.searchBtn {
  position: fixed;
  top:90px;
  right:160px
}

.searchBtnMob {
  position: absolute;
  top: 80px;
  right:80px;
}

.addBtn {
  position: fixed;
  top: 80px;
  right:70px
}

.addBtnMob {
  position: absolute;
  top: 80px;
  right:20px
}

</style>
