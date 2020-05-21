<template>
    <!-- <v-form ref="form" v-model="form.valid" lazy-validation> -->
      <v-row>
        <v-col cols="12">
          <Media :type="artefact.type" :src="artefact.blob" :format="artefact.format" />
        </v-col>
        <v-col v-for="(field, i) in fields" :key="`${field.text}-${i}`" :cols="field.cols">
          <v-text-field
            v-model="formData[field.text.toLowerCase()]"
            :type="field.type || 'string'"
            :label="field.text"
            outlined
            hide-details
            :clearable="true"
            height=5
          />
        </v-col>
      </v-row>
    <!-- </v-form> -->
</template>

<script>
import Media from '@/components/archive/Media.vue'

export default {
  name: 'RecordForm',
  components: {
    Media
  },
  props: {
    artefact: Object
  },
  data () {
    return {
      formData: this.artefact,
      fields: [
        // { text: 'Type' },
        { text: 'Title', cols: '12' },
        { text: 'Description', cols: '12' },
        { text: 'Format', cols: '6' },
        { text: 'Identifier', cols: '6' },
        { text: 'Language', cols: '6' },
        { text: 'Licence', cols: '6' },
        { text: 'Rights', cols: '6' },
        { text: 'Source', cols: '6' },
        { text: 'Duration', cols: '6', type: 'number' },
        { text: 'Size', cols: '6', type: 'number' },
        { text: 'Translation', cols: '12' },
        { text: 'Transcription' }
      ]
    }
  },
  watch: {
    artefact: {
      handler (newVal) {
        this.formData = newVal
      }
    },
    deep: true
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    customProps () {
      return {
        outlined: true,
        hideDetails: true
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>
img {
  object-fit: none;
}
</style>
