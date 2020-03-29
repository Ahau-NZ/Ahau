<template>
    <v-row class="banner">
        <v-col>
          <!-- Dialog Title -->
          <h1 class="banner-title"><span style="color: #BA041B;">{{splitTitle.maori}}</span>{{splitTitle.english}}<span></span></h1>
        </v-col>
        <!-- Close Button -->
        <v-col cols="1" class="banner-buttons">
            <v-icon class="close-button" @click="close">mdi-close</v-icon>
        </v-col>
      </v-row>
</template>

<script>

export default {
  name: 'DialogTitleBanner',
  components: {},
  props: {
    title: { type: String, default: 'Create a new person' },
  },
  data () {
    return {
      titleObj: {},
    }
  },
  computed: {
    // split the Title into two parts (so maori can be styled red, and english styled in white)
    splitTitle() {
      // check to see if is a maori & english title with the ---- in the middle
      var str = this.title;
      var substr = "----";
      if (str.indexOf(substr) !== -1) {
        var delimiter = '-';
        var start = 2;
        var maori = str.split(delimiter).slice(0, start + 1).join(delimiter);
        var english = str.split(delimiter).slice(start).join(delimiter);
        this.titleObj = {
          maori: maori,
          english: english,
        }
        return this.titleObj
      } 
      // if no maori word in the title just return english
      else {
        return this.titleObj = {
          maori: '',
          english: this.title,
        }
      }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
  },
  watch: {}
}
</script>

<style scoped>

  .banner {
    /* border: 2px solid yellow; */
    width: 100%;
    padding: 10px 20px;
    margin: 0px;
    background: #292929 url(../../assets/bg-tohu.png);
    background-size: 50%;
    background-position-x: 80%;
    background-position-y: -40px;
    background-repeat: no-repeat;
    
  }

  h1.banner-title {
    color: white;
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 3.5px;
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
