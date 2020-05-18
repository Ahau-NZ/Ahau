<template>
  <Dialog :show="show" :title="currentStory.title" @close="close" width="70vw" :goBack="close" enableMenu :dark="true">

    <!-- Content Slot -->
    <template v-slot:content>
      <v-col class="py-0 px-0">
        <v-carousel
          height="400px"
          hide-delimiter-background
          show-arrows-on-hover
          class="px-0"
        >
          <v-carousel-item
            v-for="(slide, i) in slides"
            :key="i"
          >
            <!-- Artefact -->

            <v-sheet
              :color="colors[i]"
              height="100%"
            >
              <v-row
                class="fill-height"
                align="center"
                justify="center"
              >
                <div class="display-3">{{ slide }} Slide</div>
              </v-row>
            </v-sheet>
          </v-carousel-item>
        </v-carousel>
      </v-col>
    </template>
    <!-- End Content Slot -->

  </Dialog>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ViewRecordDialog',
  components: {
    Dialog
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new person' }
  },
  data () {
    return {
      colors: [
        'indigo',
        'warning',
        'pink darken-2',
        'red lighten-1',
        'deep-purple accent-4'
      ],
      slides: [
        'First',
        'Second',
        'Third',
        'Fourth',
        'Fifth'
      ]
    }
  },
  computed: {
    ...mapGetters(['currentStory'])
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>
