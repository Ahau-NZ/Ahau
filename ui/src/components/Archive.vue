<template>
<div class="mt-8">
  <v-row>
    <!-- Middle column -->
    <v-col cols="10">
      <!-- Collections -->
      <h1 class="title my-6">Collections</h1>
      <v-row class="mx-0">
        <CollectionCard :collections="mockCollections" />
      </v-row>
      <v-divider class="mt-6 mb-12" light></v-divider>
      <!-- Name row -->
      <v-row justify="center">
        <ArchiveStory />
      </v-row>
    </v-col>
            <!-- End Middle column -->

    <!-- Right column -->
    <v-col cols="2" class="px-12">
      <!-- Communities Card -->
      <v-row>
        <v-col>
          <!-- Add icon -->
          <v-row justify="center" align="center">
            <v-btn large class="my-2" fab color="white" @click.stop="openContextMenu($event)">
              <v-icon large class="black--text">mdi-plus</v-icon>
            </v-btn>
          </v-row>
          <!-- Search icon -->
          <v-row justify="center" align="center">
            <v-btn small class="my-2" fab color="white" @click="editProfile()">
              <v-icon small class="black--text">mdi-magnify</v-icon>
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
    <!-- End Right column -->
  </v-row>
  <vue-context ref="menu" class="pa-4">
    <li v-for="(option, index) in contextMenuOpts" :key="index">
      <a href="#" @click.prevent="updateDialog(option.dialog)" class="d-flex align-center px-4">
        <v-icon light>{{ option.icon }}</v-icon>
        <p class="ma-0 pl-3">{{ option.title }}</p>
      </a>
    </li>
    <!-- <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a href="#" @click.prevent="option.action">{{ option.title }}</a>
    </li> -->
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

import Kaitiaki from '@/components/profile/Kaitiaki.vue'

import SideNavMenu from '@/components/SideNavMenu.vue'
import ArchiveStory from '@/components/ArchiveStory.vue'
import CollectionCard from '@/components/CollectionCard.vue'

import DialogHandler from '@/components/dialog/DialogHandler.vue'

// const get = require('lodash.get')

export default {
  name: 'ArchiveShow',
  data () {
    return {
      mockCollections: [{
        image: require('@/assets/mock1.jpg'),
        title: 'Life Lessons',
        description: 'Lessons that I have learned in life',
        stories: ['storyid1', 'storyid2', 'storyid3', 'storyid4'],
        lastSubmissionDate: new Date(),
        hasAccess: [{
          id: 123,
          preferredName: 'Ian',
          avatarImage: require('@/assets/koro.svg')
        },
        {
          id: 456,
          preferredName: 'Ben',
          avatarImage: require('@/assets/kuia.svg')
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
          preferredName: 'Ian',
          avatarImage: require('@/assets/koro.svg')
        },
        {
          id: 456,
          preferredName: 'Ben',
          avatarImage: require('@/assets/kuia.svg')
        }
        ]
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
    Kaitiaki,
    SideNavMenu,
    ArchiveStory,
    CollectionCard,
    VueContext,
    DialogHandler
  }
}
</script>

<style lang="scss" scoped>
@import "~vue-context/dist/css/vue-context.css";

</style>
