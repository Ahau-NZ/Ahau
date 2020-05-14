<template>
  <v-card light>
    <v-form ref="form" v-model="form.valid" lazy-validation>
      <v-row>
        <v-col cols="6">
          <v-row>
          <v-col cols="12">
            <v-text-field v-model="formData.title"
              label="Title *"
              placeholder=" "
              hide-details
              :rules="form.rules.name.record"
              outlined
            />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="formData.description"
              label="Description"
              placeholder=" "
              hide-details
              :rules="form.rules.name.record"
              outlined
            />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="formData.recordStartDate"
              label="Record Start Date"
              placeholder=" "
              hide-details
              :rules="form.rules.name.record"
              outlined
            />
          </v-col>
          <v-col cols="6">
            <v-checkbox v-if="!hasEndDate" v-model="hasEndDate" label="include an end date" hide-details outlined />
            <v-text-field
              v-else
              v-model="formData.recordDate"
              label="Record End Date"
              placeholder=" "
              hide-details
              outlined
              :clearable="!readonly"
              @click:clear="hasEndDate = false"
            />
          </v-col>
          <v-col cols="3">
            <AvatarGroup :profiles="formData.mentions" group-title="People" size="40px">
              <template v-slot:action>
                <AddButton @click="addMention" />
              </template>
            </AvatarGroup>
          </v-col>
          <v-col cols="3">
            <AvatarGroup :profiles="formData.mentions" group-title="Contribution" size="40px">
              <template v-slot:action>
                <AddButton @click="addMention" />
              </template>
            </AvatarGroup>
          </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="formData.type"
                label="Record Type"
                :items="['Life Event', 'Historic Event', 'Etc']"
                outlined
              />
            </v-col>
            <v-col cols="12">
              <AddButton label="Attach media or files" @click="addMedia"/>
            </v-col>
            <v-col cols="12">
              <AddButton label="Add location" @click="addMedia"/>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>

<script>
// import Avatar from '@/components/Avatar.vue'
// import ImagePicker from '@/components/ImagePicker.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AddButton from '@/components/button/AddButton.vue'
import AddItemCard from '@/components/archive/AddItemCard.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import Avatar from '@/components/Avatar.vue'

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
    // Avatar,
    // ImagePicker,
    NodeDatePicker,
    AddButton,
    AddItemCard,
    AvatarGroup,
    Avatar
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
      hasEndDate: false,
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
  methods: {
    addMention () {
      console.warn('add mention not implemented yet')
    }
  }
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
