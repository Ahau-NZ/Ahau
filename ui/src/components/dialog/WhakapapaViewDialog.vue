<template>
  <Dialog :show="show" @close="close()" :enableBar="false">
    <v-card>
      <v-container width="100%" height="100%" class="pa-0">
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
          <v-row justify="center">
            <v-btn @click="close">Hide</v-btn>
          </v-row>
          <v-row justify="center">
              <v-icon>
                mdi-lock
              </v-icon>
              <small class="mt-5"> Private record - Only visible by you</small>
          </v-row>
        </v-card-text>
      </v-container>
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
    close (e) {
      if (e) e.preventDefault()
      this.$emit('close')
    }
  }
}
</script>
