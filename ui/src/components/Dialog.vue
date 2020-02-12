<template>
  <transition name="dialog">
    <v-row justify="center">
      <v-dialog
        :transition="
          mobile
            ? 'dialog-bottom-transition'
            : 'scale-transition'
        "
        v-model="show"
        light
        persistent
        :max-width="width"
        :fullscreen="this.mobile"
      >
        <div>
          <Appbar
            v-if="!noBar && mobile"
            :enableMenu="enableMenu"
            app
            :goBack="goBack"
            class="pb-12"
          />
          <slot></slot>
        </div>
      </v-dialog>
    </v-row>
  </transition>
</template>

<script>
import Appbar from '@/components/Appbar.vue'
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
    },
    goBack: {
      type: Function
    },
    enableMenu: {
      type: Boolean,
      default: false
    },
    noBar: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      listener: null
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    close: function () {
      this.$emit('close')
    }
  },
  mounted () {
    this.listener = document.addEventListener('keydown', e => {
      if (e.keyCode === 27) this.close()
    })
  },
  destroyed () {
    document.removeEventListener('keydown', this.listener)
  },
  components: {
    Appbar
  }
}
</script>
