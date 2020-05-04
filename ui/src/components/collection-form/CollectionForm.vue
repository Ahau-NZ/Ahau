<template>
  <v-form ref="form" v-model="form.valid" lazy-validation>
    <v-row class="px-2">
      <v-col cols="12" sm="5" order-sm="2">
        <v-row class="pa-0">
          <v-col cols="12" class="pa-0">
            <!-- Avatar -->
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.image"
              :alt="formData.name"
              isView
            />
          </v-col>
          <v-col cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker label="Edit collection image"
              @updateAvatar="formData.image = $event"
              isView
            />
          </v-col>
          <!-- END of Avatar -->
        </v-row>
      </v-col>
      <!-- Information Col -->
      <v-col cols="12" sm="7" class="border-right">
        <v-row>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1">
            <v-text-field
              v-model="formData.name"
              label="Collection Name *"
              placeholder=" "
              hide-details
              :rules="form.rules.name.whakapapaView"
            />
          </v-col>
          <!-- Description textarea -->
          <v-col cols="12" class="pa-1">
            <v-textarea
              v-model="formData.description"
              label="Collection Description"
              placeholder=" "
              hide-details
              no-resize
              rows="1"
              auto-grow
            ></v-textarea>
          </v-col>
          
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import { RULES } from '@/lib/constants'

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
  },
  props: {
    // view: { type: Object, default () { return setDefaultWhakapapa(EMPTY_WHAKAPAPA) } },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false }
  },
  data () {
    return {
      // formData: setDefaultWhakapapa(this.view),
      formData: {},
      form: {
        valid: true,
        rules: RULES
      },
    }
  },
  watch: {
    
  },
  methods: {
  }
}

</script>

<style scoped>
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
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
</style>
