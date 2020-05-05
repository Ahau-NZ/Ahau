<template>
<div class="wrapper">
    <!-- Profile body (middle column) -->
    <v-container :fluid="true" class="body-width white px-12 niho-bg">

        <v-row>
            <!-- Left column -->
            <v-col cols="2">
                <SideNavMenu :profile="profile" />
            </v-col>

            <!-- Middle column -->
            <v-col cols="8">
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
                            <v-btn v-if="profile.canEdit" large class="my-2" fab color="white" @click.stop="openContextMenu($event)">
                                <v-icon large class="black--text">mdi-plus</v-icon>
                            </v-btn>
                        </v-row>
                        <!-- Search icon -->
                        <v-row justify="center" align="center">
                            <v-btn v-if="profile.canEdit" small class="my-2" fab color="white" @click="editProfile()">
                                <v-icon small class="black--text">mdi-magnify</v-icon>
                            </v-btn>
                        </v-row>
                    </v-col>
                </v-row>
            </v-col>
            <!-- End Right column -->

        </v-row>

    </v-container>

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

import gql from 'graphql-tag'

import {
    VueContext
} from 'vue-context'

import Kaitiaki from '@/components/profile/Kaitiaki.vue'

import SideNavMenu from '@/components/SideNavMenu.vue'
import StoryTimeline from '@/components/StoryTimeline.vue'

import DialogHandler from '@/components/dialog/DialogHandler.vue'

// const get = require('lodash.get')

export default {
    name: 'StoryShow',
    data() {
        return {
            profile: {},
            mockTimelineData: [
                {
                    title: 'Ukurau was born',
                    description: 'In Aatea, Tangaroa had a son called Ukurau',
                    img: 'https://picsum.photos/200/300',
                    people: [{
                            id: 123,
                            preferredName: 'Ian',
                            avatarImage: require('@/assets/koro.svg')
                        },
                        {
                            id: 456,
                            preferredName: 'Ben',
                            avatarImage: require('@/assets/kuia.svg')
                        },
                    ],
                    storyTypeIcon: 'mdi-diamond-outline'
                },
                {
                    title: 'Ukurau travelled to Rarotonga',
                    description: 'Ukurau landed in Rarotonga and picked up his wife Puera',
                    img: 'https://picsum.photos/200/300',
                    people: [{
                            id: 123,
                            preferredName: 'Ian',
                            avatarImage: require('@/assets/koro.svg')
                        },
                        {
                            id: 456,
                            preferredName: 'Ben',
                            avatarImage: require('@/assets/kuia.svg')
                        },
                    ],
                    storyTypeIcon: 'mdi-creation'
                },
                {
                    title: 'Ukurau arrived in Ma\'uke',
                    description: 'Ukurau arrived in Ma\'uke',
                    img: 'https://picsum.photos/200/300',
                    people: [{
                            id: 123,
                            preferredName: 'Ian',
                            avatarImage: require('@/assets/koro.svg')
                        },
                        {
                            id: 456,
                            preferredName: 'Ben',
                            avatarImage: require('@/assets/kuia.svg')
                        },
                    ],
                    storyTypeIcon: 'mdi-account-circle'
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
                },
            ],

        }
    },
    props: {
    },
    apollo: {
      profile () {
        return {
          query: gql`
            query ProfileData($id: String!) {
              person(id: $id) {
                canEdit
  
                preferredName
                legalName
                description
  
                headerImage {
                  uri
                }
                avatarImage {
                  uri
                }
              }
            }
          `,
          variables: {
            id: this.$route.params.id
          },
          // TODO this only exists to inject profile.id
          // make sure graphql resolver has the id so we don't need this
          update (data) {
            return {
              id: this.$route.params.id,
              ...data.person
            }
          },
          fetchPolicy: 'no-cache'
        }
      }
    },
    methods: {
        openContextMenu(event) {
            if (this.dialog.view) {
                this.toggleView()
            }
            this.$refs.menu.open(event)
        },
        toggleView() {
            this.dialog.view = !this.dialog.view
        },
        updateDialog (dialog) {
            this.dialog.active = dialog
        },
    },
    components: {
        Kaitiaki,
        SideNavMenu,
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
                rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
        background-position-x: 150%;
        background-repeat: no-repeat;
        background-attachment: fixed;
    }

}
</style>
