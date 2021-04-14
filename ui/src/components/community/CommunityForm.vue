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
        <v-col cols="12" align="center" v-if="!allowJoiningQuestions" class="pt-12">
          <v-btn @click="allowJoiningQuestions = true" text light color="blue">
            {{ $t('addCommunityForm.setupRegistrationForm') }}
            <v-icon>mdi-cogs</v-icon>
          </v-btn>
        </v-col>
        <v-col v-else>
          <v-row>
            <v-col cols="12">
               {{ $t('addCommunityForm.form') }}
            </v-col>
            <v-col cols="12" sm="12" v-for="(question, i) in formData.joiningQuestions" :key="`j-q-${i}`" class="pa-1, mt-4">
              <v-text-field
                v-model="formData.joiningQuestions[i].label"
                v-bind="customProps"
                append-icon="mdi-delete"
                @click:append="removeJoiningQuestion(i)"
                :label="`Question ${i + 1}`"
                auto-focus
              />
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-spacer/>
                <AddButton label="Add a question" @click="addQuestionField"/>
                <v-spacer/>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-form>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import AddButton from '@/components/button/AddButton.vue'

export default {
  name: 'CommunityForm',
  components: {
    Avatar,
    ImagePicker,
    AddButton
  },
  props: {
    formData: Object
  },
  data () {
    return {
      allowJoiningQuestions: false
    }
  },
  watch: {
    'formData.joiningQuestions': {
      deep: true,
      immediate: true,
      handler (joiningQuestions) {
        if (joiningQuestions && joiningQuestions.length > 0) this.allowJoiningQuestions = true
        else this.allowJoiningQuestions = false
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
  },
  methods: {
    addQuestionField () {
      this.formData.joiningQuestions.push({ label: '', type: 'input' })
    },
    removeJoiningQuestion (index) {
      this.formData.joiningQuestions.splice(index, 1)
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
