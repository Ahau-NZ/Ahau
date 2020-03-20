<template> 
  <v-tooltip  v-if="filterIcon" bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab small color="blue-grey">
           <v-icon light > mdi-account-multiple-minus </v-icon>
        </v-btn>
    </template>
    <span>Hide ancestors</span>
  </v-tooltip>

  <v-tooltip v-else bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab small color="blue-grey">
           <v-icon light > mdi-account-multiple-plus </v-icon>
        </v-btn>
    </template>
    <span>Show ancestors</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'FilterButton',
  data () {
    return {
      filterIcon : true
    }
  },
  methods: {
      toggle() {
      this.filterIcon = !this.filterIcon
      this.$emit('filter')
    }
  }
}  
</script>