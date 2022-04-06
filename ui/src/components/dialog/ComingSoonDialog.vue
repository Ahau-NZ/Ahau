<template>
  <!-- coming soon dialog  -->
  <v-dialog v-model="showDialog" max-width="450">
    <v-card>
      <v-card-title class="headline">Aroha mai</v-card-title>
      <v-card-text>
        These features are still under construction, but we can't wait to
        share this mahi with you soon in upcoming releases
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="close">Ka pai</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>

export default {
  name: 'ComingSoonDialog',
  props: {
    show: { type: Boolean, required: true }
  },
  data () {
    return {
      showDialog: this.show
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
</style>
