<template>
  <v-dialog
    v-model="showDialog"
    scrollable
    :max-width="width"
    :light="!dark"
    :fullscreen="mobile"
    :transition="
        mobile
          ? 'dialog-bottom-transition'
          : 'scale-transition'"
    @input="close"
  >
    <v-card>
      <!-- bar at the top of the dialog with title + close button -->
      <v-app-bar
        color="#292929"
        :dark="!dark"
        :src="banner"
        flat
        dense
        height="60px"
        max-height="60px"
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            style="opacity:40%; left:100px"
          ></v-img>
        </template>
        <v-btn
          v-if="mobile"
          icon
          @click="closeDialog"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer v-if="mobile" style="min-width:10%"/>

        <div class="dialog-title text-uppercase" :style="mobile ? 'text-align:end':''">
          <span style="color: #BA041B;font-weight:500" >{{ splitTitle.maori }}</span>
          <span>{{ splitTitle.english }}</span>
        </div>

        <v-spacer v-if="!mobile"></v-spacer>

        <v-btn
          v-if="!mobile"
          icon
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>
      <!-- for pinning things underneath the dialog top bar -->
      <slot name="pinned"></slot>

      <!-- content section for main part of dialog -->
      <v-card-text id="app-dialog" :style="mobile ? 'overflow-x: hidden;' : `max-height: 650px; overflow-x: hidden;`" class="pa-3 pb-0">
        <slot name="content"></slot>
      </v-card-text>

      <!-- bottom footer of dialog -->
      <v-divider/>
      <v-card-actions v-if="!readonly && actionsVisible && !hideActions" class="pa-0">
        <v-container class="py-0">
          <v-row>
            <v-col cols="12" md="8" v-if="$slots['before-actions']" :align="mobile ? 'center':'start'" class="py-0">
              <slot name="before-actions"></slot>
            </v-col>
            <v-spacer v-if="!mobile"/>
            <v-col v-if="hideActions" class="pa-3"></v-col>
            <slot name="actions" v-else>
              <v-col class="py-0" cols="12" md="auto" :style="mobile ? 'text-align:center;':''">
                <v-row>
                  <v-col cols="6">
                    <v-btn @click="close"
                      text
                      :large="!mobile"
                      class="secondary--text"
                    >
                      {{ t('cancel') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn @click="submit"
                      :large="!mobile"
                      text
                      color="blue"
                      :disabled="!allowSubmissions"
                    >
                      {{ t('save') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </slot>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import banner from '@/assets/bg-tohu.png'
import { mapGetters, mapMutations } from 'vuex'

import { isCordova } from '@/lib/cordova-helpers'

export default {
  name: 'Dialog',
  props: {
    show: Boolean,
    isEditing: Boolean,
    width: {
      type: String,
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
    goBack: Function,
    enableMenu: Boolean,
    enableBar: {
      type: Boolean,
      default: true
    },
    title: String,
    dark: Boolean,
    readonly: Boolean,
    hideActions: Boolean
  },
  data () {
    return {
      showDialog: this.show,
      listener: null,
      banner,
      isSubmitting: false,
      keyboardVisible: false
    }
  },
  computed: {
    ...mapGetters(['allowSubmissions']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    style () {
      return {
        position: 'fixed',
        backgroundColor: '#292929',
        maxWidth: this.width
      }
    },
    splitTitle () {
      let titleObj = {}
      // check to see if is a maori & english title with the ---- in the middle
      const str = this.title
      const substr = '----'
      if (str.indexOf(substr) !== -1) {
        const delimiter = '-'
        const start = 2
        const maori = str.split(delimiter).slice(0, start + 1).join(delimiter)
        const english = str.split(delimiter).slice(start).join(delimiter)
        titleObj = {
          maori: maori,
          english: english
        }
        return titleObj
      } else {
        // if no maori word in the title just return english
        titleObj = {
          maori: '',
          english: str
        }
        return titleObj
      }
    },
    actionsVisible () {
      return !this.mobile || !this.keyboardVisible
    }
  },
  methods: {
    ...mapMutations(['setAllowSubmissions']),
    submit () {
      if (this.isSubmitting) return
      this.isSubmitting = true
      this.$emit('submit')
    },
    closeDialog () {
      this.isSubmitting = false
      this.showDialog = false
      this.close()
    },
    close () {
      this.isSubmitting = false
      this.setAllowSubmissions(true)
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('dialog.' + key, vars)
    },
    setKeyboardVisible (isVisible) {
      if (!isCordova()) return

      this.keyboardVisible = isVisible
    }
  },
  mounted () {
    this.listener = document.addEventListener('keydown', e => {
      if (e.keyCode === 27) this.close()
    })
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.minWidth = '100%'
    document.body.style.position = 'fixed'

    if (isCordova()) {
      this.setKeyboardVisible(window.Keyboard.isVisible)

      window.addEventListener('keyboardWillShow', () => this.setKeyboardVisible(true))
      window.addEventListener('keyboardWillHide', () => this.setKeyboardVisible(false))
    }
  },
  destroyed () {
    document.removeEventListener('keydown', this.listener)
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    window.scrollTo(0, parseInt(scrollY || '0') * -1)
  }
}
</script>

<style scoped lang="scss">
.dialog-title {
  font: 'Roboto';
  font-weight: 400;
  font-size: 0.99rem;
  letter-spacing: 0.1666666667em;
}

.align-btn {
  align-items: start;
}
</style>
