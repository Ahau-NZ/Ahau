<template> 
  <v-tooltip  v-if="tableIcon" bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab small color="blue-grey">
          <v-icon light > mdi-file-tree </v-icon>
        </v-btn>
    </template>
    <span>Registry</span>
  </v-tooltip>

  <v-tooltip v-else bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab small color="blue-grey">
            <img width="30" src="../../assets/tree.svg" alt="tree">
        </v-btn>
    </template>
    <span>Whakapapa</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'TableButton',
  data () {
    return {
      tableIcon : true
    }
  },
  methods: {
      toggle() {
      this.tableIcon = !this.tableIcon
      this.$emit('table')
    }
  }
}  
</script>
