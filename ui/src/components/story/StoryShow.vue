<template>
<div class="mt-8">
    <!-- Profile body (middle column) -->
    <v-row>
      <!-- Middle column -->
      <v-col cols="10">
        <h1 class="title my-6">Timeline</h1>
        <StoryTimeline :data="mockTimelineData"/>
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
              <v-btn small class="my-2" fab color="white" @click="alert('todo')">
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

import { VueContext } from 'vue-context'
import StoryTimeline from './StoryTimeline.vue'
import DialogHandler from '@/components/dialog/DialogHandler.vue'

// const get = require('lodash.get')

export default {
  name: 'StoryShow',
  data () {
    return {
      profile: {},
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
    StoryTimeline,
    VueContext,
    DialogHandler
  }
}
</script>

<style lang="scss" scoped>
@import "~vue-context/dist/css/vue-context.css";

h1 {
    color: black;
}

$avatarSize: 25vh;
$ratio: 5.33333;
$headerHeight: 100vw / $ratio;
$maxHeaderWidth: 1400px;
$formWidth: 600px;

.wrapper {
    margin-top: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // background: linear-gradient(to right, grey 0%,grey 50%,#000000 50%,white 50%,white 100%);

    .body-width {
        min-width: $formWidth;
        max-width: 100vw;
        min-height: 100vh;
        background: white;
    }

    .rounded-card {
        border-radius: 10px;

        p {
            font-size: 0.8em;
            line-height: 1.6;
        }
    }

    .avatar-row {
        /* position: relative;
  width: 100%;
  height: 20%;
  margin: auto; */

        .avatar-box {
            /* position: absolute;
    left: calc(-100vw / 3 + 3 * #{$avatarSize});
    top: -$avatarSize/1.5; */
        }
    }

    .col-subtitle {
        color: black;
        text-align: center;
    }

    v-card {
        margin: 0;
        padding: 0;
    }

    .niho-bg {
        background: linear-gradient(rgba(255, 255, 255, 0.7),
                rgba(255, 255, 255, 0.7)), url(../../assets/niho.svg);
        background-position-x: 150%;
        background-repeat: no-repeat;
        background-attachment: fixed;
    }

}
</style>
