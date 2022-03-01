<template>
  <v-tooltip v-if="!table" bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle" fab x-small color="black">
          <v-icon light > mdi-view-list-outline </v-icon>
        </v-btn>
    </template>
    <span>Registry</span>
  </v-tooltip>

  <v-tooltip v-else bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle" fab x-small color="black">
            <img width="25" src="../../assets/icons/tree-white.svg" alt="tree">
        </v-btn>
    </template>
    <span>Whakapapa</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'TableButton',
  props: {
    table: Boolean
  },
  methods: {
    toggle () {
      this.$emit('table')
    }
  }
}
</script>
