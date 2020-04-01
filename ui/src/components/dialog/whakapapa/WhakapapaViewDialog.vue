<template>
  <Dialog :show="show" @close="close" width="720px" :goBack="close" :enableBar="false">
    <template v-slot:top>
      <Avatar
        class="big-avatar"
        size="250px"
        :image="view.image"
        :alt="view.name"
        :view="view"
        isView
      />
    </template>
    <template v-slot:title>
      <h1>{{ view.name }}</h1>
      <v-btn
        @click="$emit('edit')"
        align="right"
        color="white"
        text
        x-small
        class="blue--text"
      >
        <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
      </v-btn>
    </template>
    <template v-slot:content>
      <v-row justify="center">
        <v-col>
          {{ view.description }}
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-btn @click="close">Hide</v-btn>
      </v-row>
      <v-row justify="center" align="center" class="mt-5">
        <v-icon>
           mdi-lock
        </v-icon>
        <small> Private record - Only visible by you</small>
      </v-row>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
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
    }
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close (e) {
      if (e) e.preventDefault()
      this.$emit('close')
    }
  }
}
</script>
