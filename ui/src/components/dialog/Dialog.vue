<template>
  <transition name="dialog">
    <v-row justify="center">
      <v-dialog
        :transition="
          mobile
            ? 'dialog-bottom-transition'
            : 'scale-transition'"
        v-model="show"
        light
        persistent
        :max-width="width"
        :fullscreen="mobile"
      >
        <div>
          <Appbar
            v-if="enableBar && mobile"
            :enableMenu="enableMenu"
            app
            :goBack="goBack"
            class="pb-12"
          />
          <v-card :min-height="mobile ? height : 'auto'">
            <v-container width="100%" class="pa-5 pb-2" :style="`background: ${background};`">
              <slot name="top"></slot>
              <v-row class="px-2">
                <v-col class="pa-0">
                  <slot name="title"></slot>
                </v-col>
                <v-col v-if="!mobile" cols="3" class="pa-0 pt-2" align="right">
                  <v-btn @click="close" small fab text top right color="secondary" class="close">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <slot name="content"></slot>
              <v-row>
                <slot name="before-actions" class="pt-0 pb-0"></slot>
                <v-col :align="mobile ? '' : 'right'" class="pt-0 pb-0">
                  <slot name="actions"></slot>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
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
    height: {
      type: String,
      default: 'calc(100vh)'
    },
    background: {
      type: String,
      default: ''
    },
    goBack: {
      type: Function
    },
    enableMenu: {
      type: Boolean,
      default: false
    },
    enableBar: {
      type: Boolean,
      default: true
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
    close () {
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
