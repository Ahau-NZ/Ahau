<template>
  <v-tooltip bottom>
      <template v-slot:activator="{ on }">
         <v-btn v-on="on" @click="toggle()" fab small color="blue-grey">
           <v-icon light >mdi-help</v-icon>
         </v-btn>
      </template>
      <span>Instructions</span>
    </v-tooltip>
</template>

<script>
export default {
  name: 'HelpButton',
  methods: {
    toggle () {
      this.$emit('click')
    }
  }
}

</script>
