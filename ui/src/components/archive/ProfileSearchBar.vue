<template>
  <div style="width: 180px;">
    <v-combobox
      v-if="openMenu"
      :items="items"
      :item-text="item"
      item-value="id"
      :multiple="!single"
      :menu-props="{ light: true, value: openMenu, closeOnClick: true, openOnClick: true }"
      hide-selected
      append-icon="mdi-close"
      @click:append="close"
      :placeholder="placeholder"
      no-data-text="no suggestions found"
      hide-details
      dense
      rounded
      outlined
      deletable-chips
      :searchInput.sync="searchInput"
      :autofocus="openMenu"
      id="combobox"
      ref="combobox"
      bottom
      :blur="clearSuggestions"
      class="search-input"
    >
      <template v-slot:selection="data">
        <slot name="selection" :data="data"></slot>
      </template>
      <template v-slot:item="data">

        <!-- MENTIONS + CONTRIBUTORS + CREATOR -->
        <template v-if="type === 'profile'">
          <v-list-item @click="addSelectedItem(data.item)">
            <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :aliveInterval="data.item.aliveInterval" />
            <v-list-item-content>
              <v-list-item-title> {{ data.item.preferredName }} </v-list-item-title>
              <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-content>
              <v-list-item-title> {{ data.item.legalName ? data.item.legalName :  '&nbsp;' }} </v-list-item-title>
              <v-list-item-subtitle>Legal name</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-title> {{ age(data.item.aliveInterval) }} </v-list-item-title>
              <v-list-item-subtitle>Age</v-list-item-subtitle>
            </v-list-item-action>
          </v-list-item>
        </template>

        <!-- ACCESS -->
        <template v-else-if="type === 'commuinty'">
          <v-list-item @click="addSelectedItem(data.item)">
            <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :aliveInterval="data.item.aliveInterval" />
            <v-list-item-content>
              <v-list-item-title> {{ data.item.preferredName }} </v-list-item-title>
              <v-list-item-subtitle>Community name</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-title> {{ age(data.item.aliveInterval) }} </v-list-item-title>
              <v-list-item-subtitle>Members</v-list-item-subtitle>
            </v-list-item-action>
          </v-list-item>
        </template>

        <!-- RELATED RECORDS + COLLECTIONS -->
        <template v-else-if="type === 'collection'">
          <v-list-item @click="addSelectedItem(data.item, $event)">
            <Avatar class="mr-3" size="40px" isView :image="data.item.image"/>
            <v-list-item-content>
              <v-list-item-title>
                {{ data.item.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>

        <!-- CATEGORIES -->
        <template v-else>
          <v-list-item @click="addSelectedItem(data.item, $event)">
            {{ data.item }}
          </v-list-item>
        </template>
      </template>
      <template v-slot:no-data></template>
    </v-combobox>
    <slot></slot>
  </div>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import calculateAge from '@/lib/calculate-age'

export default {
  name: 'ProfileSearchBar',
  props: {
    label: String,
    openMenu: {
      type: Boolean,
      default: false
    },
    item: String,
    selectedItems: {
      type: [Object, Array]
    },
    items: {
      type: Array,
      default () {
        return []
      }
    },
    single: {
      type: Boolean,
      default: false
    },
    type: String,
    placeholder: { type: String, default: ' ' }
  },
  data () {
    return {
      chips: this.selectedItems,
      searchInput: '',
      parentElement: null,
      childElement: null,
      disableFocus: false
    }
  },
  components: {
    Avatar
  },
  watch: {
    chips: {
      deep: true,
      handler (newValue) {
        console.log('chips: ', newValue)
        this.$emit('update:selectedItems', newValue)
      }
    },
    searchInput (newValue) {
      console.log('search: ', newValue)
      if (!newValue) return
      if (newValue.length > 2) {
        this.$emit('getSuggestions', newValue)
      }
    }
  },
  methods: {
    clearSuggestions () {
      console.log('clearing')
      this.$emit('getSuggestions', null)
    },
    age (aliveInterval) {
      return calculateAge(aliveInterval)
    },
    close () {
      console.log('i should close')
      this.$emit('update:openMenu', false)
      this.clearSuggestions()
    },
    open () {
      console.log('open')
      return true
    },
    addSelectedItem (item) {
      console.log('adding: ', item)
      if (Array.isArray(this.chips)) {
        this.chips.push(item)
      } else {
        this.chips = item
      }
      this.$emit('update:openMenu', false)
    },
    removeSelectedItem (item) {
      this.chips.slice(item, 1)
    }
  }
}
</script>
<style>
.cb .v-select__slot {
     border-left: 1px solid rgba(0,0,0,0.12);
    padding: 4px 0;
}

.search-input >>> input{
  text-align: start !important;
}
</style>
