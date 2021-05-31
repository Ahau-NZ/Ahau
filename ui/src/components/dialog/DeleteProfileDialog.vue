<template>
  <Dialog :title="t('title')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>
          <b>{{ t('warning') }}</b>{{ t('undone') }}
        </p>
        <v-checkbox
          v-model="removeProfile"
          :label="t('removeProfile')"
          hide-details
        />
        <v-checkbox
          v-model="keepProfileVisible"
          :label="t('keepProfileVisible')"
          hide-details
        />
      </v-card-text>
    </template>
    <template v-slot:actions>
        <v-btn
          class="white--text my-3"
          style="margin-right: 20px"
          color="black"
          @click.prevent="deleteProfile"
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
      removeProfile: false,
      keepProfileVisible: false
    }
  },
  methods: {
    deleteProfile () {
      console.log('delete my profile')
    },
    cancel () {
      this.$emit('cancel')
    },
    t (key, vars) {
      return this.$t('deleteProfileForm.' + key, vars)
    },
    close () {
      this.$emit('close')
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
