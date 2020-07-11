<template>
  <transition name="dialog">
    <v-row justify="center">
      <v-dialog
        :transition="
          mobile
            ? 'dialog-bottom-transition'
            : 'scale-transition'"
        v-model="showDialog"
        :light="!dark"
        :max-width="width"
        :fullscreen="mobile"
        @input="closeDialog"
      >
        <div>
          <!-- Dialog Card -->
          <v-card :min-height="mobile ? height : 'auto'" style="overflow-x:hidden !important">
            <v-container width="100%" class="pa-1 pb-2" :style="`background: ${background};`">

              <!--=== TOP OF DIALOG CARD ===-->
              <DialogTitleBanner :title="title" :mobile="mobile" @close="close"  :isEditing="isEditing"/>
              <!-- Slots -->
              <slot name="top"></slot>
              <slot name="title"></slot>

              <!--=== CONTENT OF DIALOG CARD ===-->
              <!-- Slot = Content see: NewNodeDialogV2.vue for content -->
              <slot name="content"></slot>

              <!--=== BOTTOM OF DIALOG CARD ===-->
              <v-row>
                <!-- Slot = before-actions -->
                <slot name="before-actions" ></slot>

                <v-col
                  :align="mobile ? '' : 'right'"
                  :class="{
                    'pt-3': true,
                    'pb-0': true,
                    'd-flex': mobile,
                    'justify-space-between': mobile
                  }"
                >
                <!-- Slot = Actions (eg. close/submit buttons) -->
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

import DialogTitleBanner from '@/components/dialog/DialogTitleBanner.vue'

export default {
  props: {
    show: {
      type: Boolean,
      required: false
    },
    isEditing: {
      type: Boolean,
      required: false
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
    },
    title: {
      type: String,
      default: 'Create a new person'
    },
    dark: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showDialog : this.show,
      listener: null,
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    closeDialog() {
      this.showDialog = false
      this.$emit('close')
    },
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
    DialogTitleBanner
  }
}
</script>

<style scoped lang="scss">

</style>
