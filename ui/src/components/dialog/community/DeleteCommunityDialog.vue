<template>
  <DialogContainer :title="`Delete community profile`" :show="show" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <template v-slot:content>
      <v-card-subtitle>
        <div class="warning-blurb">
          Are you sure you want to delete this community profile and all its connections, including members, stories and artefacts?
        </div>
      </v-card-subtitle>
    </template>
  </DialogContainer>
</template>

<script>
export default {
  name: 'DeleteCommunityDialog',
  props: {
    show: { type: Boolean, required: true }
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
      // this.close()
      this.$emit('submit')
    }
  }
}
</script>
