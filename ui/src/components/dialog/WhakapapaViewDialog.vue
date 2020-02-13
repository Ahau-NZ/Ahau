<template>
  <Dialog :show="show" @close="close()" :enableBar="false">
    <WhakapapaViewCard :view="view" :shadow="false">
      <v-row class="lock-container">
        <v-col class="lock-icon">
          <v-icon small color="#555">mdi-lock</v-icon>
          <span id="lock-icon-margin"
            >Private record - Only visible by you</span
          >
        </v-col>
      </v-row>
      <v-row>
        <v-btn @click="close">Hide</v-btn>
      </v-row>
    </WhakapapaViewCard>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
import WhakapapaViewCard from '@/components/whakapapa-view/WhakapapaViewCard.vue'

export default {
  name: 'WhakapapaViewDialog',
  components: {
    Dialog,
    WhakapapaViewCard
  },
  props: {
    view: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Whakapapa View'
    }
  },
  methods: {
    close: function (e) {
      if (e) e.preventDefault()
      this.$emit('close')
    }
  }
}
</script>
