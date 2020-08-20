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
        <v-btn
          v-if="mobile"
          icon
          @click="closeDialog"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer v-if="mobile"/>

        <div class="dialog-title text-uppercase">
          <span style="color: #BA041B;">{{ splitTitle.maori }}</span>
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
      <v-card-actions class="pa-0 py-2">
        <v-container class="py-0 pt-1">
          <v-row>
            <v-col cols="12" md="auto" v-if="$slots['before-actions']" align="center" class="py-0">
              <slot name="before-actions"></slot>
            </v-col>
            <v-spacer v-if="!mobile"/>
            <slot name="actions">
              <v-col cols="6" md="auto" :align="mobile ? 'center' : 'end'" class="py-0">
                <v-btn @click="close"
                  fab
                  icon
                  large
                  class="secondary--text"
                >
                  <v-icon color="secondary">mdi-close</v-icon>
                </v-btn>
                </v-col>

                <v-col cols="6" md="auto" :align="mobile ? 'center' : 'end'" class="py-0">
                <v-btn @click="$emit('submit')"
                  fab
                  icon
                  large
                  class="blue--text"
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
import banner from '../../assets/bg-tohu.png'

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
      banner
    }
  },
  computed: {
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
    closeDialog () {
      this.showDialog = false
      this.close()
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
  .mobile-banner {
    width: 100vw;
    position: relative;
    right:5px;
    bottom:5px;
    padding: 5px 5px;
    margin: 0px;

    // background: #292929 url(../../assets/bg-tohu.png);
    // background-size: 80%;
    // background-position-x: 80%;
    // background-position-y: 5px;
    // background-repeat: no-repeat;

    h1.banner-title {
      color: white;
      font-size: 0.9em;
      text-transform: uppercase;
      font-weight: 400;
      letter-spacing: 3.5px;
    }

  }
  .desktop-banner {
    position: relative;;
    width: 100%;
    padding: 10px 20px;
    margin: 0px;

    // background: #292929 url(../../assets/bg-tohu.png);
    // background-size: 50%;
    // background-position-x: 80%;
    // background-position-y: -40px;
    // background-repeat: no-repeat;

    h1.banner-title {
      color: white;
      font-size: 1em;
      text-transform: uppercase;
      font-weight: 400;
      letter-spacing: 3.5px;
    }

  }

  .banner-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    /* border: 2px solid green; */
  }

  .close-button {
    color: white;

  }
</style>
