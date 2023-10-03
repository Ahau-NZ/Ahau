<template>
  <DialogContainer :title="`Remove artefact from story`" :show="show" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <template v-slot:content>
      <v-card-subtitle>
        <div class="warning-blurb">
          Are you sure you want to remove this artefact from this story?
        </div>
      </v-card-subtitle>
    </template>
  </DialogContainer>
</template>

<script>
import DialogContainer from '@/components/dialog/DialogContainer.vue'

export default {
  props: {
    show: { type: Boolean, required: true },
    index: { type: Number, required: true }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    height () {
      if (this.mobile) {
        return 'calc(100vh - 50px)'
      } else return 'auto'
    }
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', this.index)
      this.close()
    }
  },
  components: {
    DialogContainer
  }
}
</script>
