<template>
  <Dialog :title="title" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-0">
        <p>
          This whakapapa tool has been designed to help you easily explore and view whanau information. <br />
          To do this we have built in some core features and will continue to
          add more as requested by the community.
          <br />
          <b>Show/Hide relationships : </b> Select this option if you would like to show or hide the whanau links between parents and children<br />
          <b>Show/Hide ancestors : </b> Select this option if you would like to show or hide whanau ancestors that are no longer living<br />
          <b>View person: </b> Click on the arrow icon above a person and select view person to view more information that has been recorded about this person
          <br />
          <b>Add child: </b> Click on the arrow icon above a person and select add child to enter a childs information and update the record.
          <br />
          <b>Add parent: </b>  Click on the arrow icon above a person and select add child to enter a childs information and update the record.
          their information <br />
          <b>Delete: </b> If someone has been added to the record incorrectly they can be deleted if the have been created in error. Click on the arrow icon above a person and select Delete to remove a person and their children from the tree. Please be careful
          when deleting someone as that information cannot be brought back and
          will have to be added again. <br />
          <b>Sort: </b> When adding a person, use order of birth to sort the
          whanau members by order of birth. <br />
        </p>
        <p>
          Start by clicking on someone or adding a person in your family.<br />
          Karawhiua!
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
    </template>
  </Dialog>
</template>
<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: "" }
  },
  name: 'WhakapapaShowHelper',
  data () {
    return {
      items: [
        { src: require('../../../assets/table.png') },
        { src: require('../../../assets/relationships.png') },
        { src: require('../../../assets/ancestors.png') },
        { src: require('../../../assets/table-menu.png') }
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
