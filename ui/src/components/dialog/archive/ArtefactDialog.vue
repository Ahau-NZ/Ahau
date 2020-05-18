<template>
  <div>
    <Dialog :show="show" :title="artefact.title" @close="close" width="500px" :goBack="close" enableMenu>

      <!-- FORM -->
      <template v-slot:content>
        <ArtefactForm :artefact.sync="artefact"/>
      </template>
      <ArtefactForm />

      <!-- x ✓ BUTTONS -->
      <template v-slot:actions>
        <v-btn @click="close"
          text large fab
          class="secondary--text"
        >
          <v-icon color="secondary">mdi-close</v-icon>
        </v-btn>
        <v-btn @click="submit"
          text large fab
          class="blue--text"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </template>

    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import ArtefactForm from '@/components/archive/ArtefactForm.vue'

export default {
  name: 'NewRecordDialog',
  components: {
    Dialog,
    ArtefactForm
  },
  props: {
    artefact: Object,
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', this.formData)
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
</style>
