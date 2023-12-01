<template>
  <v-row class="mx-2">
    <v-col cols="12">
      <p class="overline black--text">{{ t('registrationQuestions') }}</p>
      <p class="black--text">{{ t('form') }}</p>
    </v-col>
    <v-col cols="10" v-for="(question, i) in questions" :key="`j-q-${i}`" class="pa-1">
      <v-text-field
        v-model="questions[i].label"
        append-icon="mdi-delete"
        @click:append="removeQuestion(i)"
        :label="`Question ${i + 1}`"
        :placeholder="t('questionPlaceholder')"
        auto-focus
        outlined
        hide-details
      />
    </v-col>
    <v-col cols="12" justify="start" class="px-1 py-0">
      <v-btn color="#3b3b3b" class="white--text" @click="addQuestionField">
        <v-icon class="pr-1">mdi-plus</v-icon> {{ t('addQuestion') }}
      </v-btn>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: {
    joiningQuestions: Array
  },
  data () {
    return {
      questions: []
    }
  },
  watch: {
    questions: {
      deep: true,
      immediate: true,
      handler (questions) {
        this.$emit('update:joiningQuestions', questions)
      }
    },
    joiningQuestions: {
      immediate: true,
      handler (joiningQuestions) {
        this.questions = joiningQuestions || []
      }
    }
  },
  methods: {
    addQuestionField () {
      this.questions.push({ label: '', type: 'input' })
    },
    removeQuestion (index) {
      this.questions.splice(index, 1)
    },
    t (key, vars) {
      return this.$t('addCommunityForm.' + key, vars)
    }
  }
}
</script>
