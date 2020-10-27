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
        <v-spacer v-if="mobile"/>

        <div class="dialog-title text-uppercase">
          <span style="color: #BA041B; font-weight:500">{{ splitTitle.maori }}</span>
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
      <v-card-text :style="mobile ? 'overflow-x: hidden;' : `max-height: 650px; overflow-x: hidden;`" class="pa-3">
        <slot name="content"></slot>
      </v-card-text>
      <v-divider/>
      <v-card-actions class="pa-0">
        <v-container class="py-0">
          <v-row>
            <v-col cols="12" md="auto" v-if="$slots['before-actions']" align="center" class="py-0">
              <slot name="before-actions"></slot>
            </v-col>
            <v-spacer v-if="!mobile"/>
            <slot name="actions">
              <v-col cols="6" md="auto" :align="mobile ? 'center' : 'end'" class="py-0 pb-2 pb-md-0">
                <v-btn @click="close"
                  :fab="!mobile"
                  icon
                  :large="!mobile"
                  class="secondary--text"
                >
                  <v-icon color="secondary">mdi-close</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="6" md="auto" :align="mobile ? 'center' : 'end'" class="py-0">
                <v-btn @click="submit"
                  :fab="!mobile"
                  icon
                  :large="!mobile"
                  class="blue--text"
                  :disabled="!allowSubmissions"
                >
                  <v-icon>mdi-check</v-icon>
                </v-btn>
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

export default {
  name: 'Dialog',
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
    goBack: Function,
    enableMenu: Boolean,
    enableBar: {
      type: Boolean,
      default: true
    },
    title: String,
    dark: Boolean
  },
  data () {
    return {
      showDialog: this.show,
      listener: null,
      banner,
      isSubmitting: false
    }
  },
  watch: {
    showDialog (newVal) {
      console.log(newVal)
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
      var str = this.title
      var substr = '----'
      if (str.indexOf(substr) !== -1) {
        var delimiter = '-'
        var start = 2
        var maori = str.split(delimiter).slice(0, start + 1).join(delimiter)
        var english = str.split(delimiter).slice(start).join(delimiter)
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
    }
  },
  mounted () {
    this.listener = document.addEventListener('keydown', e => {
      if (e.keyCode === 27) this.close()
    })
  },
  destroyed () {
    document.removeEventListener('keydown', this.listener)
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
</style>
