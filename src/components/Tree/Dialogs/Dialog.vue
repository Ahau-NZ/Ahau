<template>
  <transition name="dialog">
    <v-row justify="center">
      <v-dialog v-model="show"
        light
        persistent
        max-width="1000px"
      >
        <slot></slot>
      </v-dialog>
    </v-row>
  </transition>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    close: function () {
      this.$emit('close')
    }
  },
  mounted: function () {
    document.addEventListener('keydown', (e) => {
      if (this.show && e.keyCode === 27) {
        this.close()
      }
    })
  }
}
</script>
