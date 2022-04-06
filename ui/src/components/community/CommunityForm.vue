<template>
  <v-form ref="form" light>
    <v-col>
      <v-row>

        <!-- Upload profile photo -->
        <v-col order-sm="2" class="mt-5">
          <v-row>
            <v-col cols="12" class="pa-0">
              <!-- Avatar -->
              <Avatar class="big-avatar" size="200px" :image="formData.avatarImage" :alt="formData.preferredName" isView />
            </v-col>
            <!-- Upload Profile Photo Button -->
            <v-col cols="12" justify="center" align="center" class="pa-0">
              <ImagePicker @updateAvatar="formData.avatarImage = $event" :avatarLoaded="formData.avatarImage" type="avatar" isView />
            </v-col>
          </v-row>
        </v-col>

        <!-- Names -->
        <v-col cols="12" sm="6" class="pt-4">
          <v-row>
            <v-col cols="12" class="pa-1">
              <!-- <slot name="search"> -->
                <v-text-field v-model="formData.preferredName" :label="$t('addCommunityForm.name')" v-bind="customProps"/>
              <!-- </slot> -->
            </v-col>
          </v-row>
          <v-row>
            <!-- Description textarea -->
            <v-col cols="12" class="pa-1">
              <v-textarea v-model="formData.description" :label="$t('addCommunityForm.description')" v-bind="customProps" no-resize rows="4"
                auto-grow>
              </v-textarea>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Address -->
          <v-text-field v-model="formData.address" :label="$t('addCommunityForm.address')" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- City -->
          <v-text-field v-model="formData.city" :label="$t('addCommunityForm.city')" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Post Code -->
          <v-text-field v-model="formData.postCode" :label="$t('addCommunityForm.postCode')" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Country -->
          <v-text-field v-model="formData.country" :label="$t('addCommunityForm.country')" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Email -->
          <v-text-field v-model="formData.email" :label="$t('addCommunityForm.email')" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Phone -->
          <v-text-field v-model="formData.phone" :label="$t('addCommunityForm.phone')" v-bind="customProps" />
        </v-col>
      </v-row>
    </v-col>
  </v-form>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'

export default {
  name: 'CommunityForm',
  components: {
    Avatar,
    ImagePicker
  },
  props: {
    communityProfile: Object
  },
  data () {
    return {
      formData: this.communityProfile,
      allowJoiningQuestions: false
    }
  },
  watch: {
    formData: {
      deep: true,
      handler (formData) {
        this.$emit('update:communityProfile', formData)
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customProps () {
      return {
        hideDetails: true,
        placeholder: ' ',
        outlined: true
      }
    }
  }
}
</script>

<style scoped lang="scss">
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

.v-text-field input {
  text-align: center !important;
}

</style>
