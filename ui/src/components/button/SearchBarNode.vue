<template>
  <v-combobox
    v-model="displayString"
    :menu-props=" { light: true } "
    append-icon="mdi-close"
    @click:append="setSearchedProfileId(null)"
    rounded
    outlined
    light
    hide-selected
    dense
    hide-details
    readonly
    class="search-input"
    autofocus
  >
  </v-combobox>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'SearchBarNode',
  props: {
    // TODO: derive from searchedProfileId
    searchNodeName: String
  },
  data () {
    return {
      activeNode: null
    }
  },
  computed: {
    displayString () {
      return 'Selected: ' + this.searchNodeName
    }
  },
  methods: {
    ...mapActions('tree', ['setSearchedProfileId'])
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
