<template>
  <Dialog :title="'Pūranga ---- Archive'" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>An Archive is where you create, store and access your Records</p>
        <p>
          A Record is a digital copy, account or recording of a piece of information that is of some personal or commuinty significance. In particular information related to your heritage or culture. These may include things like memories, histories, stories, events, and legends.
        </p>
        <p>
          In Āhau there are two types of Archives
          <ul>
            <li><strong>Your personal archive</strong>, completely private and securely encrypted to your own personal device. Your personal Archive is created when you first create an account for Āhau</li>
            <li><strong>A whānau archive</strong>, which is a shared archive that has a privately shared encryption key and is only accessible by approved whānau members personal devices. A community Archive is created whenever you create a new tribe in Āhau</li>
          </ul>
        </p>
        <p>
          When creating a Record you can decide which Archive you would like to store the Record in by changing the <i>'Access'</i> to either yourself, or a whānau group that you are apart of.
        </p>
      </v-card-text>
      <v-divider />
      <p>
          Example images
      </p>
      <v-carousel hide-delimiters height="100%">
        <v-tooltip
          v-for="(item,i) in examples"
          :key="i" top>
          <template v-slot:activator="{ on }">
            <v-carousel-item
              v-on="on"
              :src="item.src"
              style="background-size:contain"
            ></v-carousel-item>
          </template>
          <span> {{item.text}} </span>
        </v-tooltip>
      </v-carousel>
    </template>
    <template v-slot:actions>
      <v-col :align="mobile ? 'center' : 'end'" class="py-0">
        <v-btn
          text
          @click="close"
        >
          close
        </v-btn>
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'WhakapapaListHelper',
  data () {
    return {
      items: [
        { src: require('../../../assets/images/add-record.png'),
          text: 'add stories and records to archive' },
        { src: require('../../../assets/images/edit-artefact.png'),
          text: 'add artefacts and media to records ' },
        { src: require('../../../assets/images/view-archive.png'),
          text: 'view all your stories in one place' },
        { src: require('../../../assets/images/view-story.png'),
          text: 'view individual stories for more information' }
      ],
      mobileItems: [
        { src: require('../../../assets/images/mobile-add-record.png'),
          text: 'add stories and records to archive' },
        { src: require('../../../assets/images/mobile-edit-artefact.png'),
          text: 'add artefacts and media to records ' },
        { src: require('../../../assets/images/mobile-view-archive.png'),
          text: 'view all your stories in one place' }
      ]
    }
  },
  components: {
    Dialog
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    examples () {
      if (this.mobile) return this.mobileItems
      return this.items
    }
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
.image {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: auto;
  height:auto
}
</style>
