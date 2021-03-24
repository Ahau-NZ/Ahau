<template>
  <v-combobox
    v-model="displayString"
    :menu-props=" { light: true } "
    append-icon="mdi-cancel"
    @click:append="clearSearchNodeId()"
    solo
    rounded
    light
    hide-selected
    dense
    readonly
    class="search-input"
    autofocus
  >
  </v-combobox>
</template>

<script>

export default {
  name: 'SearchBar',
  components: {
  },
  props: {
    searchNodeId: String,
    searchNodeName: String
  },
  data () {
    return {
      searchString: '',
      activeNode: null
    }
  },
  computed: {
    displayString () {
      return 'Selected: ' + this.searchNodeName
    }
  },
  methods: {
    clearSearchNodeId () {
      this.$emit('update:searchNodeId', '')
    }
  }
}
</script>

<style>
   .v-text-field.v-input--dense .v-input__append-inner .v-input__icon > .v-icon {
     margin: 0px;
   }
</style>

<style scoped lang="scss">
  .search-input {
    padding: 0;
    margin: 0;
    margin-top: -3px;
  }
</style>
