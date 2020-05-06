<template>
  <v-form ref="form" v-model="form.valid" lazy-validation>
    <v-row class="px-2">
      <v-col cols="12" sm="5" order-sm="2">
        <v-row>
          <!-- Upload Media and files -->
          <v-col cols="12" class="pa-0">
            <AvatarGroup :profiles="mockdata" size="40px" :show-labels="false" @profile-click="openProfile($event)"
            :addButtonSlot="false" />
            <AddButtonMini :label="'Attach media or files'" class="pb-2" />
            <!-- <Avatar class="big-avatar" size="250px" :image="formData.image" :alt="formData.name" isView />
          </v-col>
          <v-col cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker label="Edit collection image" @updateAvatar="formData.image = $event" isView /> -->
          </v-col>
        </v-row>
        <v-row class="py-12">
          <!-- Add Location -->
          <v-col cols="12" class="pa-0">
            <AvatarGroup :profiles="mockdata" size="40px" :show-labels="false" @profile-click="openProfile($event)"
            :addButtonSlot="false" />
            <AddButtonMini :label="'Add Location'" class="pb-2" />
          </v-col>
        </v-row>
      </v-col>
      <!-- Information Col -->
      <v-col cols="12" sm="7" class="border-right">
        <v-row>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1">
            <v-text-field v-model="formData.name" label="Title *" placeholder=" " hide-details
              :rules="form.rules.name.record" outlined />
          </v-col>
          <!-- Description textarea -->
          <v-col cols="12" class="pa-1">
            <v-textarea v-model="formData.description" label="Description" placeholder=" " hide-details no-resize
              rows="1" auto-grow outlined></v-textarea>
          </v-col>
          <!-- Start date picker -->
          <v-col cols="6" class="pa-1">
            <NodeDatePicker :value="formData.startDate" label="Record start date" @date="formData.startDate = $event" />
          </v-col>
          <!-- End date checkbox -->
          <v-col cols="6" class="pa-1">
            <v-checkbox v-model="formData.endDate" label="include an end date" :hide-details="true" outlined />
          </v-col>
          <!-- End date picker -->
          <v-col cols="6" class="pa-1" v-if="formData.endDate">
            <NodeDatePicker label="Record end date" :value="formData.endDate" @date="formData.endDate = $event"
              :readonly="readonly" />
          </v-col>
          <v-col cols="12">
            <v-row>
              <!-- Mentions -->
              <v-col cols="3" class="px-1">
                <AddButtonMini :label="'Mention'" class="pb-2" />
                <AvatarGroup :profiles="mockdata" size="40px" :show-labels="false" @profile-click="openProfile($event)"
                  :addButtonSlot="false" />
              </v-col>
              <!-- Category -->
              <v-col cols="3" class="px-1">
                <AddButtonMini :label="'Category'" class="pb-2" />
                <v-chip class="my-1" small outlined close close-icon="mdi-close" label>
                  Documents
                </v-chip>
                <v-chip class="my-1" small outlined close close-icon="mdi-close" label>
                  Whenua
                </v-chip>
              </v-col>
              <!-- Collection -->
              <v-col cols="6" class="px-1">
                <AddButtonMini :label="'Collection'" class="pb-2" />
                <v-col v-for="(item, i) in mockdata" :key="i" cols="12" class="px-0 py-1">
                  <v-card light outlined class="d-flex">
                    <v-avatar class="ma-0" size="50" tile>
                      <v-img :src="item.image.uri"></v-img>
                    </v-avatar>
                    <div class="d-flex flex-no-wrap justify-space-between">
                      <div>
                        <v-card-title class="body-2" v-text="item.whakapapaName"></v-card-title>
                        <!-- <v-card-subtitle v-text="item.artist"></v-card-subtitle> -->
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-col>
            </v-row>
            <v-row>
              <!-- Access -->
              <v-col cols="3" class="px-1">
                <AddButtonMini :label="'Access'" class="pb-2" />
                <AvatarGroup :profiles="mockdata" size="40px" :show-labels="false" @profile-click="openProfile($event)"
                  :addButtonSlot="false" />
              </v-col>
              <!-- Protocols -->
              <v-col cols="3" class="px-1">
                <AddButtonMini :label="'Protocols'" class="pb-2" />
                <AvatarGroup :profiles="mockdata" size="40px" :show-labels="false" @profile-click="openProfile($event)"
                  :addButtonSlot="false" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-divider light></v-divider>

    <v-row>
      <!-- Additional info expansion panel -->
      <v-expansion-panels v-model="panel" flat>
        <v-expansion-panel>
          <v-expansion-panel-header class="body-2 field">Additional info</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <!-- Contributor -->
              <v-col cols="2" class="px-1">
                <AddButtonMini :label="'Contributor'" class="pb-2" />
                <AvatarGroup :profiles="mockdata" size="40px" :show-labels="false" @profile-click="openProfile($event)"
                  :addButtonSlot="false" />
              </v-col>
              <!-- Creator -->
              <v-col cols="2" class="px-1">
                <AddButtonMini :label="'Creator'" class="pb-2" />
                <AvatarGroup :profiles="mockdata" size="40px" :show-labels="false" @profile-click="openProfile($event)"
                  :addButtonSlot="false" />
              </v-col>
              <!-- Related records -->
              <v-col cols="3" class="px-1">
                <AddButtonMini :label="'Related Records'" class="pb-2" />
                <v-col v-for="(item, i) in mockdata" :key="i" cols="12" class="px-0 py-1">
                  <v-card light outlined class="d-flex">
                    <v-avatar class="ma-0" size="50" tile>
                      <v-img :src="item.image.uri"></v-img>
                    </v-avatar>
                    <div class="d-flex flex-no-wrap justify-space-between">
                      <div>
                        <v-card-title class="body-2" v-text="item.whakapapaName"></v-card-title>
                        <!-- <v-card-subtitle v-text="item.artist"></v-card-subtitle> -->
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-col>
              <!-- Submission date -->
              <v-col cols="3" class="px-1">
                <NodeDatePicker :value="formData.submissionDate" label="Submission date"
                  @date="formData.startDate = $event" class="mt-8" />
              </v-col>
            </v-row>
            <v-row>
              <!-- Contribution notes -->
              <v-col cols="12" class="pa-1">
                <v-textarea v-model="formData.contributionNotes" label="Contribution notes" placeholder=" " hide-details
                  no-resize rows="1" auto-grow outlined></v-textarea>
              </v-col>
              <!-- Location description -->
              <v-col cols="12" class="pa-1">
                <v-textarea v-model="formData.locationDescription" label="Location description" placeholder=" "
                  hide-details no-resize rows="1" auto-grow outlined></v-textarea>
              </v-col>
              <!-- Cultural narative -->
              <v-col cols="12" class="pa-1">
                <v-textarea v-model="formData.culturalNarrative" label="Cultural narative" placeholder=" " hide-details
                  no-resize rows="1" auto-grow outlined></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <!-- Format -->
              <v-col cols="3" class="pa-1">
                <v-text-field v-model="formData.fileFormat" label="Format" placeholder=" " hide-details
                  :rules="form.rules.name.record" outlined />
              </v-col>
              <!-- Identifier -->
              <v-col cols="3" class="pa-1">
                <v-text-field v-model="formData.identifier" label="Identifier" placeholder=" " hide-details
                  :rules="form.rules.name.record" outlined />
              </v-col>
              <!-- Source -->
              <v-col cols="3" class="pa-1">
                <v-text-field v-model="formData.source" label="Source" placeholder=" " hide-details
                  :rules="form.rules.name.record" outlined />
              </v-col>
              <!-- Language -->
              <v-col cols="3" class="pa-1">
                <v-text-field v-model="formData.language" label="Language" placeholder=" " hide-details
                  :rules="form.rules.name.record" outlined />
              </v-col>
            </v-row>
            <v-row>
              <!-- Translation -->
              <v-col cols="12" class="pa-1">
                <v-textarea v-model="formData.translation" label="Translation" placeholder=" " hide-details
                  no-resize rows="1" auto-grow outlined></v-textarea>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>

    <v-divider light></v-divider>

  </v-form>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AddButtonMini from '@/components/button/AddButtonMini.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'

import {
  RULES
} from '@/lib/constants'

// const EMPTY_WHAKAPAPA = {
//   name: '',
//   description: '',
//   mode: 'descendants',
//   focus: 'self',
//   image: null
// }

// function setDefaultWhakapapa (whakapapa) {
//   return {
//     name: whakapapa.name,
//     description: whakapapa.description,
//     mode: whakapapa.mode,
//     focus: whakapapa.focus,
//     image: whakapapa.image
//   }
// }

export default {
  name: 'CollectionForm',
  components: {
    Avatar,
    ImagePicker,
    NodeDatePicker,
    AddButtonMini,
    AvatarGroup
  },
  props: {
    // view: { type: Object, default () { return setDefaultWhakapapa(EMPTY_WHAKAPAPA) } },
    readonly: {
      type: Boolean,
      default: false
    },
    hideDetails: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // formData: setDefaultWhakapapa(this.view),
      formData: {
        title: null,
        description: null,
        startDate: null,
        endDate: null,
        mentions: [],
        category: [],
        collection: null,
        access: [],
        protocols: [],
        submissionDate: null,
        contributionNotes: null,
        locationDescription: null,
        culturalNarrative: null,
        fileFormat: null,
        identifier: null,
        source: null,
        language: null,
        translation: null
      },
      form: {
        valid: true,
        rules: RULES
      },
      mockdata: [{
        id: 123,
        preferredName: 'Ian',
        whakapapaName: 'Tairea whanau',
        avatarImage: {
          uri: require('@/assets/koro.svg')
        },
        image: {
          uri: require('@/assets/mock1.jpg')
        }
      },
      {
        id: 456,
        preferredName: 'Ben',
        whakapapaName: 'Horne whanau',
        avatarImage: {
          uri: require('@/assets/kuia.svg')
        },
        image: {
          uri: require('@/assets/mock2.jpg')
        }
      }
      ],
      panel: [0, 1]
    }
  },
  watch: {

  },
  methods: {}
}
</script>

<style scoped>
  .custom.v-text-field>.v-input__control>.v-input__slot:before {
    border-style: none;
  }

  .custom.v-text-field>.v-input__control>.v-input__slot:after {
    border-style: none;
  }

  .close {
    top: -25px;
    right: -10px;
  }

  .big-avatar {
    position: relative;
    top: -20px;
  }

  .v-input--checkbox label {
    font-size: 14px;
  }

  .v-input--radio-group__input label {
    font-size: 14px;
  }

  .v-chip__close {
    font-size: 16px !important;
  }

  .field {
    color: rgba(0, 0, 0, 0.6);
  }
</style>
