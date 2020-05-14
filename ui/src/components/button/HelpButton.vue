<template>
  <v-tooltip bottom>
      <template v-slot:activator="{ on }">
         <v-btn v-on="on" @click="toggle()" fab x-small color="#241023">
           <v-icon color="white" >mdi-information</v-icon>
         </v-btn>
      </template>
      <span>Instructions</span>
    </v-tooltip>
</template>

<script>
export default {
  // name: 'HelpButton',
  methods: {
    toggle () {
      this.$emit('click')
    }
  }
}

</script>
