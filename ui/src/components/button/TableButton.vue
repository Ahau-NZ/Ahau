<template> 
  <v-tooltip bottom>
      <template v-slot:activator="{ on }">
         <v-btn v-on="on" @click="toggle()" fab small color="blue-grey">
           <v-icon  v-if="tableIcon" light >mdi-table</v-icon>
           <v-icon v-else light >mdi-file-tree</v-icon>
         </v-btn>
      </template>
      <span>registry</span>
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