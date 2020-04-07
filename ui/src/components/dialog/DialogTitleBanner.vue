<template>
  <div>

    <!-- MOBILE top banner -->
    <v-row v-if="mobile" class="mobile-banner">
      <!-- Close Button -->
      <v-col cols="1" class="banner-buttons">
          <v-icon class="close-button" color="white" @click="close">mdi-arrow-left</v-icon>
      </v-col>
      <v-col class="d-flex align-center justify-end" style="text-align: right;">
          <!-- Dialog Title -->
          <h1 v-if="!isEditing" class="banner-title"><span style="color: #BA041B;">{{splitTitle.maori}}</span>{{splitTitle.english}}<span></span></h1>
          <h1 v-else class="banner-title">Edit <span style="color: #BA041B;">{{splitTitle.maori}}</span>{{splitTitle.english}}<span></span></h1>
        </v-col>
    </v-row>

    <!-- DESKTOP top banner -->
    <v-row v-else class="desktop-banner">
      <v-col>
        <!-- Dialog Title -->
        <h1 v-if="!isEditing" class="banner-title"><span style="color: #BA041B;">{{splitTitle.maori}}</span>{{splitTitle.english}}<span></span></h1>
        <h1 v-else class="banner-title"><span style="color: #BA041B;">Edit {{splitTitle.maori}}</span>{{splitTitle.english}}<span></span></h1>
      </v-col>
      <!-- Close Button -->
      <v-col cols="1" class="banner-buttons">
          <v-icon class="close-button" color="white" @click="close">mdi-close</v-icon>
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  name: 'DialogTitleBanner',
  components: {},
  props: {
    title: { type: String, default: 'Create a new person' },
    mobile: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false }
  },
  data () {
    return {
      titleObj: {}
    }
  },
  computed: {
    // split the Title into two parts (so maori can be styled red, and english styled in white)
    splitTitle () {
      // check to see if is a maori & english title with the ---- in the middle
      var str = this.title
      var substr = '----'
      if (str.indexOf(substr) !== -1) {
        var delimiter = '-'
        var start = 2
        var maori = str.split(delimiter).slice(0, start + 1).join(delimiter)
        var english = str.split(delimiter).slice(start).join(delimiter)
        this.titleObj = {
          maori: maori,
          english: english
        }
        return this.titleObj
      } else {
        // if no maori word in the title just return english
        this.titleObj = {
          maori: '',
          english: this.title
        }
        return this.titleObj
      }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">

  .mobile-banner {
    width: 100%;
    padding: 10px 20px;
    margin: 0px;

    display: flex;
    justify-content: center;
    align-items: center;

    background: #292929 url(../../assets/bg-tohu.png);
    background-size: 80%;
    background-position-x: 80%;
    background-position-y: 5px;
    background-repeat: no-repeat;

    /* resize banner outside container */
    transform: scale(1.15);
    margin-top: -15px;
    margin-bottom: 10px;

    h1.banner-title {
      color: white;
      font-size: 0.8em;
      text-transform: uppercase;
      font-weight: 400;
      letter-spacing: 3.5px;
    }

  }
  .desktop-banner {
    width: 100%;
    padding: 10px 20px;
    margin: 0px;
    background: #292929 url(../../assets/bg-tohu.png);
    background-size: 50%;
    background-position-x: 80%;
    background-position-y: -40px;
    background-repeat: no-repeat;

    /* resize banner outside container */
    transform: scale(1.05);
    margin-top: -15px;
    margin-bottom: 10px;

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
