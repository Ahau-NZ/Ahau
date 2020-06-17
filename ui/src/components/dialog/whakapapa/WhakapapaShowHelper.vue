<template>
  <Dialog :title="title" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-5">
        <p>
          This whakapapa tool has been designed to help you create,
          explore and update your whānau whakapapa records. <br />
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
      <p>
          Example images
      </p>
      <v-carousel hide-delimiters>
        <v-tooltip v-for="(item,i) in items"
              :key="i" top>
          <template v-slot:activator="{ on }">
            <v-carousel-item
              v-on="on"
              :src="item.src"
              class="centerImage"
            >
            </v-carousel-item>
          </template>
          <span>{{item.text}}</span>
        </v-tooltip>
      </v-carousel>
    </template>
  </Dialog>
</template>
<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: '' }
  },
  name: 'WhakapapaShowHelper',
  data () {
    return {
      items: [
        { src: require('../../../assets/images/menu.png'),
          text: 'actions menu' },
        { src: require('../../../assets/images/parent.png'),
          text: 'adding a person' },
        { src: require('../../../assets/images/view.png'),
          text: 'a persons profile' },
        { src: require('../../../assets/images/example.png'),
          text: 'an example whakapapa' }
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
