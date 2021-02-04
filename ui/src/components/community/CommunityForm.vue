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
                <v-text-field v-model="formData.preferredName" label="Community name" v-bind="customProps"/>
              <!-- </slot> -->
            </v-col>
          </v-row>
          <v-row>
            <!-- Description textarea -->
            <v-col cols="12" class="pa-1">
              <v-textarea v-model="formData.description" label="Community description" v-bind="customProps" no-resize rows="4"
                auto-grow>
              </v-textarea>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Address -->
          <v-text-field v-model="formData.address" label="Address" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- City, Country -->
          <v-text-field v-model="formData.location" label="City, Country" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Email -->
          <v-text-field v-model="formData.email" label="Email" v-bind="customProps" />
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <!-- Phone -->
          <v-text-field v-model="formData.phone" label="Phone" v-bind="customProps" />
        </v-col>
        <v-col cols="12" v-if="!allowJoiningQuestions">
          <v-checkbox v-model="allowJoiningQuestions" label="Add questions to ask joining members?"/>
        </v-col>
        <v-col v-else>
          <v-row>
            <v-col cols="12">
              Member Joining Questions
            </v-col>
            <v-col cols="12" sm="12" v-for="(question, i) in formData.joiningQuestions" :key="`j-q-${i}`" class="pa-1, mt-4">
              <v-text-field
                v-model="formData.joiningQuestions[i].label"
                v-bind="customProps"
                :label="`Question ${i + 1}`"
                auto-focus
                @blur="checkRemovalNeeded(i)"
              />
            </v-col>
            <v-col cols="12" v-if="!disableAddQuestion">
              <v-row>
                <v-spacer/>
                <AddButton label="Add a question" @click="addQuestionField" :disabled="disableAddQuestion"/>
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
        if (joiningQuestions.length > 0) this.allowJoiningQuestions = true
      }
    },
    allowJoiningQuestions (allowed) {
      if (!allowed) this.formData.joiningQuestions = [] // clear the questions
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    currentQuestion () {
      if (this.formData.joiningQuestions.length === 0) return null

      return this.formData.joiningQuestions[this.formData.joiningQuestions.length - 1]
    },
    disableAddQuestion () {
      if (!this.currentQuestion) return false

      if (this.currentQuestion.label === '') return true

      return false
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
      if (this.disableAddQuestion) return

      this.formData.joiningQuestions.push({ label: '', type: 'input' })
    },
    checkRemovalNeeded (i) {
      if (this.formData.joiningQuestions[i].label === '') this.formData.joiningQuestions.splice(i, 1)
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
