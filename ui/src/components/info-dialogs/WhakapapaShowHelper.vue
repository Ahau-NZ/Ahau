<template>
  <Dialog :show="show" @close="close" :width="`650px`" enableMenu :goBack="close">
    <v-card>
      <v-row class="mr-0">
        <v-col class="py-0" cols="10">
          <v-card-title>
            <span class="headline">Whakapapa tree</span>
          </v-card-title>
        </v-col>
        <!-- Dialog close button -->
        <v-col v-if="!mobile" class="pb-0" align="right" cols="2">
          <v-btn @click="close" class="close" fab text color="secondary">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-card-text class="pt-0">
        <p>
          This whakapapa tool has been designed to help you create,
          explore and update your whānanu whakapapa records. <br />
          To do this we have built in some core features and will continue to
          add more as requested by the community.
          <br />
          <b>Pan : </b> Click and hold anywhere and move the mouse, to move
          the tree around
          <br />
          <b>Zoom : </b> Use the mouse scroll to Zoom in or out. You can also
          double click to Zoom in <br />
          <b>View person: </b> Click on the arrow icon above a person and select view person to view information that has been recorded about this person
          <br />
          <b>Add child: </b> Click on the arrow icon above a person and select add child to enter a childs information and update the record.
          <br />
          <b>Add parent: </b>  Click on the arrow icon above a person and select add child to enter a childs information and update the record.
          their information <br />
          <b>Delete: </b> If someone has been added to the record incorrectly they can be either hidden from this record or deleted if the have been created in error. Click on the arrow icon above a person and select Delete to remove a person and their children from the tree. Please be careful
          when deleting someone as that information cannot be brought back and
          will have to be added again. <br />
          <b>Sort: </b> When adding a person, use order of birth to sort the
          name in order from 1st born - last born. <br />
        </p>
        <p>
          Start by clicking on someone or adding a person in your family.<br />
          Karawhiua
        </p>
      </v-card-text>
      <v-divider />
      <v-carousel hide-delimiters>
        <v-carousel-item
          v-for="(item,i) in items"
          :key="i"
          :src="item.src"
          class="centerImage"
        ></v-carousel-item>
      </v-carousel>
    </v-card>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'WhakapapaShowHelper',
  data () {
    return {
      items: [
        { src: require('../../assets/menu.png') },
        { src: require('../../assets/parent.png') },
        { src: require('../../assets/view.png') },
        { src: require('../../assets/example.png') }
      ]
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  },
  components: {
    Dialog
  }
}
</script>
<style scoped>
.centerImage {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  height:auto
}
</style>
