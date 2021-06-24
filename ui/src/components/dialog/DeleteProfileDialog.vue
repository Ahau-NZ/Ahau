<template>
  <Dialog :title="t('title')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>
          <b>{{ t('warning') }}</b>{{ t('undone') }}
        </p>
        <p>
          {{ t('notBackedUp') }}
        </p>
      </v-card-text>
      <v-card-text class="pt-4" style="text-align:center">
        <p>
          {{ t('confirmDeletePrompt') }}
        </p>
        <p>
          <b>{{ t('deletePhrase') }}</b>
        </p>
      </v-card-text>
      <v-text-field
        v-model="confirmDeleteInput"
        outlined
      />
    </template>
    <template v-slot:actions>
      <v-btn
        class="white--text my-3"
        style="margin-right: 20px"
        color="secondary"
        @click.prevent="submit"
        :disabled="!userInputMatches"
      >
        {{ t('deleteButton') }}
      </v-btn>
      <v-btn
        class="black--text my-3"
        style="margin-right: 20px"
        color="white"
        @click.prevent="cancel"
      >
        {{ t('cancelButton') }}
      </v-btn>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'KeyBackupDialog',
  components: {
    Dialog
  },
  data () {
    return {
      confirmDeleteInput: ''
    }
  },
  computed: {
    userInputMatches () {
      return this.confirmDeleteInput === this.t('deletePhrase')
    }
  },
  methods: {
    submit () {
      this.$emit('submit')
      this.close()
    },
    close () {
      this.$emit('close')
    },
    cancel () {
      this.$emit('cancel')
    },
    t (key, vars) {
      return this.$t('deleteProfileForm.' + key, vars)
    }
  }
}
</script>
<style scoped>
v-btn {
  height:100px;
  margin-right: 20px;
}
</style>
