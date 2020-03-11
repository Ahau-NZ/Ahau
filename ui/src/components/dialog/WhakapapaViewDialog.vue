<template>
  <Dialog :show="show" @close="close()" enableBar enableMenu :goBack="close">
    <v-card>
      <v-row>
        <v-col class="py-0" cols="10">
          <v-card-title>
            <span class="subtitle-2">Whakapapa record</span>
            <v-icon  class="px-3" color="blue-grey" light @click="viewHelper" >mdi-information</v-icon>
          </v-card-title>
        </v-col>
        <v-col v-if="!mobile" class="pb-0" align="right" cols="2">
          <!-- Dialog close button -->
          <v-btn @click="close" class="close" fab text color="secondary"
            :class="{
            'pt-4': mobile,
            'pr-12': mobile
            }">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-card-text>
        <Avatar
          class="big-avatar"
          size="250px"
          :image="view.image"
          :alt="view.name"
          :view="view"
          isView
        />
        <v-row>
          <v-col>
            <h1>{{ view.name }}</h1>
            <v-btn
              @click="$emit('edit')"
              align="right"
              color="white"
              text
              x-small
              class="blue--text pt-3"
            >
              <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            {{ view.description }}
          </v-col>
        </v-row>
        <v-row class="mx-1">
            <v-icon>
              mdi-lock
            </v-icon>
            <small class="ma-2"> Private record - Only visible by you</small>
        </v-row>
      </v-card-text>
    </v-card>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
import whakapapa from '@/assets/whakapapa.svg'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'WhakapapaViewDialog',
  components: {
    Dialog,
    Avatar
  },
  props: {
    view: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Whakapapa View'
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    background () {
      if (this.view.image && this.view.image.uri) {
        return {
          backgroundImage: `url(${this.view.image.uri})`,
          backgroundSize: 'cover'
        }
      }

      return {
        backgroundImage: `url(${whakapapa})`,
        backgroundSize: 'contain'
      }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    viewHelper () {
      this.$emit('viewHelper')
    }
  }
}
</script>
