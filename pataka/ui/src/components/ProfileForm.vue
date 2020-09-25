<template>
  <v-form ref="form" light class="px-4">
    <v-row>
      <!-- Upload profile photo -->
      <v-col :order="mobile ? '' : '2'" class="py-0">
        <v-row class="justify-center pt-3">
          <!-- <v-col cols="12" class="pa-0" > -->
          <!-- Avatar -->
          <Avatar
            class="big-avatar"
            size="200px"
            :image="formData.avatarImage"
            :alt="formData.preferredName"
            :gender="formData.gender"
            :isView="true"
            :isEditing="isEditing"
            @updateAvatar="formData.avatarImage = $event"
          />
        </v-row>
        <v-row v-if="isEditing" class="justify-center">
          <h1>Edit {{ formData.preferredName }}</h1>
        </v-row>
        <v-row v-if="isEditing" class="justify-center">
          <v-btn @click="$emit('cancel')" color="white" text medium class="blue--text">
            <v-icon small class="blue--text" left>mdi-close</v-icon>Cancel
          </v-btn>
        </v-row>
        <v-row>
          <!-- </v-col> -->
          <!-- Upload Profile Photo Button -->
          <v-col v-if="!isEditing" cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker
              @updateAvatar="formData.avatarImage = $event"
              :avatarLoaded="formData.avatarImage"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- Names -->
      <v-col cols="12" :sm="mobile ? '12' : '6'" class="pt-4">
        <v-row>
          <v-col cols="12" class="pa-1">
            <slot name="search">
              <v-text-field v-model="formData.preferredName" label="Pātaka name" outlined />
            </slot>
          </v-col>
        </v-row>
        <v-row>
          <!-- Description textarea -->
          <v-col cols="12" class="pa-1">
            <v-textarea
              v-model="formData.description"
              label="Description"
              no-resize
              rows="10"
              auto-grow
              outlined
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

export default {
  name: 'ProfileForm',
  components: {
    Avatar,
    ImagePicker
  },
  props: {
    profile: { type: Object, required: true },
    mobile: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: this.profile,
      form: {
        valid: true,
        showDescription: false
      }
    }
  }
}
</script>

<style scoped lang="scss">
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

.v-text-field input {
  text-align: center !important;
}

.text-field {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.8em;
  margin: 0;
}
</style>
