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

                <!-- Collections -->
                <h1 class="title my-6">Collections</h1>
                <v-row>
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

    <vue-context ref="menu" style="border: 2px solid red;">
        <a href="#" @click.prevent="updateDialog(option.dialog, option.type)" class="d-flex align-center px-4">
          <v-icon>{{ option.icon }}</v-icon>
          <p class="ma-0 pl-3">{{ option.title }}</p>
        </a>
        <li v-for="(option, index) in contextMenuOpts" :key="index">
            <a href="#" @click.prevent="option.action">{{ option.title }}</a>
        </li>
    </vue-context>
<!-- 
    <DialogHandler
      :dialog.sync="dialog.active"
      :type.sync="dialog.type"
    /> -->


    <!-- <NewCollectionDialog :show="showCollectionDialog" @close="toggleCollectionDialog" @submit="handleStepOne($event)" /> -->

    <!-- <NewEntryDialog
          :show="showEntryForm"
          @close="toggleEntryForm"
          @submit="handleStepOne($event)"
        /> -->
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

// import DialogHandler from '@/components/dialog/DialogHandler.vue'

// const get = require('lodash.get')

export default {
    name: 'ArchiveShow',
    data() {
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
                        },
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
                        },
                    ]
                }
            ],
            dialog: {
                view: false,
            },
            showCollectionDialog: false,
            showEntryDialog: false,
            contextMenuOpts: [{
                    title: 'Create new Collection',
                    action: this.toggleCollectionDialog,
                    icon: 'mdi-folder-multiple-outline'
                },
                {
                    title: 'Create new Entry',
                    action: this.toggleEntryDialog,
                    icon: 'mdi-file-multiple-outline'
                },
            ],
            
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
        toggleCollectionDialog() {
            this.showCollectionDialog = !this.showCollectionDialog
        },
        toggleEntryDialog() {
            this.showEntryDialog = !this.showEntryDialog
        },
        openContextMenu(event) {
            console.log("plus click:", event)
            if (this.dialog.view) {
                this.toggleView()
            }
            console.log(this.$refs.menu)
            this.$refs.menu.open(event)
        },
        toggleView() {
            this.dialog.view = !this.dialog.view
        },
    },
    components: {
        Kaitiaki,
        SideNavMenu,
        ArchiveStory,
        CollectionCard,
        NewCollectionDialog,
        VueContext
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
