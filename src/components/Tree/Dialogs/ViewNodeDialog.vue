<template>
  <Dialog :show="show" @close="close">
    <v-form ref="form"
    >
      <v-card>
        <v-card-title>
          <span class="headline">
            View Person
          </span>
        </v-card-title>
        <v-card-text>
          <v-container light>
            <v-row>
              Title: {{ node.data.title }}
            </v-row>
            <v-row>
              Gender: {{ node.data.gender }}
            </v-row>
            <v-row>
              Date Of Birth: {{ node.data.dateOfBirth }}
            </v-row>
            <v-row>
              Date Of Death: {{ node.data.dateOfDeath }}
            </v-row>
            <v-row>
              Preferred Name: {{ node.data.preferredName }}
            </v-row>
            <v-row>
              Legal Name: {{ node.data.legalName }}
            </v-row>
            <v-row>
              Legally Adopted: {{ node.data.adopted }}
            </v-row>
            <v-row>
              Raised: {{ node.data.raised }}
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-form>
  </Dialog>
</template>

<script>
import Dialog from './Dialog.vue'

export default {
  components: {
    Dialog
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    node: {
      type: Object,
      required: false,
      default () {
        return {
          title: '',
          gender: '',
          preferredName: '',
          legalName: '',
          dateOfBirth: '',
          dateOfDeath: '',
          adopted: false,
          raised: false,
          children: []
        }
      }
    }
  },
  data () {
    return {

    }
  },
  methods: {
    close: function () {
      console.log(this.node)
      this.$emit('close')

      // reset forms?
    },
    save: function () {
      // do stuff here

      this.close()
    }
  }
}
</script>
