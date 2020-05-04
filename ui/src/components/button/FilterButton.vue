<template>
  <v-tooltip  v-if="!filter" bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab x-small color="blue-grey">
           <v-icon light > mdi-account-multiple-minus </v-icon>
        </v-btn>
    </template>
    <span>Hide ancestors</span>
  </v-tooltip>

  <v-tooltip v-else bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab x-small color="blue-grey">
           <v-icon light > mdi-account-multiple-plus </v-icon>
        </v-btn>
    </template>
    <span>Show ancestors</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'FilterButton',
  props: {
    filter: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggle () {
      this.$emit('filter')
    }
  }
}
</script>
