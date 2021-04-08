<template>
  <div style="width: 250px">
    <v-combobox
      v-if="openMenu"
      v-model="chips"
      id="combobox"
      ref="combobox"
      :items="items"
      item-value="id"
      :item-text="item"
      :menu-props="{ light: true }"
      hide-selected append-icon="mdi-close"
      @click:append="close"
      :placeholder="placeholder"
      multiple
      no-data-text="no suggestions found"
      hide-details dense rounded outlined
      :searchInput.sync="searchInput"
      :autofocus="openMenu"
      class="search-input"
      allow-overflow
      @blur="close($event)"
    >
      <template v-slot:selection="{}">
      </template>
      <template v-slot:item="{ item }">
        <!-- MENTIONS + CONTRIBUTORS + CREATOR -->
        <template v-if="item.type === 'person'">
          <v-list-item class="click" @mousedown="addSelectedItem(item)">
            <Avatar class="mr-3" size="40px" :image="item.avatarImage" :alt="getDisplayName(item)" :gender="item.gender" :aliveInterval="item.aliveInterval" />
            <v-list-item-content>
              <v-list-item-title> {{ item.preferredName || 'No preferred name' }} </v-list-item-title>
              <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-content>
              <v-list-item-title> {{ item.legalName || 'No legal name' }} </v-list-item-title>
              <v-list-item-subtitle>Legal name</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-title> {{ age(item.aliveInterval) || 'No age' }} </v-list-item-title>
              <v-list-item-subtitle>Age</v-list-item-subtitle>
            </v-list-item-action>
          </v-list-item>
        </template>

        <!-- ACCESS -->
        <template v-else-if="item.type === 'community'">
          <v-list-item class="click" @mousedown="addSelectedItem(item)">
            <Avatar class="mr-3" size="40px" :image="item.avatarImage" isView :alt="getDisplayName(item)" :gender="item.gender" :aliveInterval="item.aliveInterval" />
            <v-list-item-content>
              <v-list-item-title> {{ item.preferredName || 'Untitled Tribe' }} </v-list-item-title>
              <v-list-item-subtitle>Tribe name</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-title> {{ 'N/A' }} </v-list-item-title> <!-- TODO: add a count for the amount of members in the tribe -->
              <v-list-item-subtitle>Members</v-list-item-subtitle>
            </v-list-item-action>
          </v-list-item>
        </template>

        <!-- RELATED RECORDS -->
        <template v-else-if="item.type === '*'">
          <v-card flat light  justify="center" height="90%" width="100%" class="click" @mousedown="addSelectedItem(item)">
            <Chip
              :title="item.title || item.name || 'Untitled'"
              :description="item.description || 'No description'"
              :type="item.type"
              :chip="item"
              :image="getImage(item)"
            />
          </v-card>
        </template>

        <!-- CATEGORIES -->
        <template v-else>
          <v-list-item class="click" @click="addSelectedItem(item)">
            {{ item }}
          </v-list-item>
        </template>
      </template>
    </v-combobox>
    <slot></slot>
  </div>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import calculateAge from '@/lib/calculate-age'
import Chip from '@/components/archive/Chip.vue'

// default image for list items
import niho from '@/assets/niho.svg'

import { getDisplayName } from '@/lib/person-helpers.js'

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
    placeholder: {
      type: String,
      default: ' '
    }
  },
  data () {
    return {
      chips: [],
      searchInput: ''
    }
  },
  components: {
    Avatar,
    Chip
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  watch: {
    selectedItems: {
      deep: true,
      immediate: true,
      handler (newValue) {
        this.chips = newValue
      }
    },
    chips: {
      deep: true,
      handler (newValue) {
        this.$emit('update:selectedItems', newValue)
      }
    },
    searchInput (newValue) {
      if (!newValue) return
      if (newValue.length > 1) {
        this.$emit('getSuggestions', newValue)
      } else {
        this.clearSuggestions()
      }
    }
  },
  methods: {
    getDisplayName,
    getImage (item) {
      // for stories
      const { artefacts } = item
      if (artefacts && artefacts.length > 0) {
        // still in link format
        var artefact = artefacts[0].artefact
        if (artefact.type === 'photo') return artefact.blob.uri
      }

      // related records
      // collections
      if (item && item.image && item.image.uri) return item.image.uri

      // default
      return niho
    },
    clearSuggestions () {
      this.$emit('getSuggestions', null)
    },
    age (aliveInterval) {
      return calculateAge(aliveInterval)
    },
    close () {
      this.$emit('update:openMenu', false)
      this.clearSuggestions()
    },
    addSelectedItem (item) {
      if (Array.isArray(this.chips) && !this.single) {
        this.chips.push(item)
      } else {
        this.chips = [item]
      }
      this.$emit('update:openMenu', false)
    }
  }
}
</script>

<style>
.cb .v-select__slot {
    border-left: 1px solid rgba(0, 0, 0, 0.12);
    padding: 4px 0;
}

.search-input>>>input {
    text-align: start !important;
}

.search-input {
    overflow: auto;
    background-color: white;
    z-index: 101;
}

.click {
  cursor:pointer
}

.click:hover {
  background-color: rgba(0, 0, 0, 0.08);
}
</style>
