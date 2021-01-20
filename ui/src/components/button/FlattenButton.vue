<template>
  <v-tooltip  v-if="flattenIcon" bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab x-small color="blue-grey">
           <v-icon light > mdi-format-list-bulleted </v-icon>
        </v-btn>
    </template>
    <span>Show relationships</span>
  </v-tooltip>

  <v-tooltip v-else bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab x-small color="blue-grey">
           <v-icon light > mdi-file-tree </v-icon>
        </v-btn>
    </template>
    <span>Hide relationships</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'FlattenButton',
  data () {
    return {
      flattenIcon: true
    }
  },
  methods: {
    toggle () {
      this.flattenIcon = !this.flattenIcon
      this.$emit('flatten')
    }
  }
}
</script>
