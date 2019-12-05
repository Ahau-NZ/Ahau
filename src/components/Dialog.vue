<template>
  <transition name="dialog">
    <v-row justify="center">
      <v-dialog v-model="show"
        light
        persistent
        :max-width="width"
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
    },
    width: {
      type: String,
      required: false,
      default: '1000px'
    }
  },
  data () {
    return {
      listener: null
    }
  },
  methods: {
    close: function () {
      this.$emit('close')
    }
  },
  mounted () {
    this.listener = document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) this.close()
    })
  },
  destroyed () {
    document.removeEventListener('keydown', this.listener)
  }
}
</script>
