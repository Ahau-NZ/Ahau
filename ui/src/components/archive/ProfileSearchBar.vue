<template>
  <div>
    <v-combobox
      v-model="chips"
      v-if="openMenu"
      :items="items"
      item-value="preferredName"
      :multiple="!single"
      :menu-props="{ light: true, value: openMenu }"
      hide-selected
      append-icon=""
      placeholder=" "
      hide-details
      dense
      outlined
      deletable-chips
      :searchInput.sync="searchInput"
      @blur.stop="closeMenu($event)"
      :autofocus="openMenu"
    >
      <template v-slot:selection="data">
        <slot name="selection" :data="data"></slot>
      </template>
      <template v-slot:item="data">
        <template v-if="type === 'profile'">
          <v-list-item @click="addSelectedItem(data.item)">
            <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :bornAt="data.item.bornAt" />
            <v-list-item-content>
              <v-list-item-title> {{ data.item.legalName ? data.item.legalName :  '&nbsp;' }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-else-if="type === 'collection'">
          <v-list-item @click="addSelectedItem(data.item)">
            <Avatar class="mr-3" size="40px" isView :image="data.item.image"/>
            <v-list-item-content>
              <v-list-item-title>
                {{ data.item.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item @click="addSelectedItem(data.item)">
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

export default {
  name: 'ProfileSearchBar',
  props: {
    label: String,
    openMenu: {
      type: Boolean,
      default: false
    },
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
    type: String
  },
  data () {
    return {
      chips: this.selectedItems,
      searchInput: ''
    }
  },
  components: {
    Avatar
  },
  watch: {
    chips: {
      deep: true,
      handler (newValue) {
        this.$emit('update:selectedItems', newValue)
      }
    }
  },
  methods: {
    closeMenu ($event) {
      console.log($event)
      this.$emit('update:openMenu', false)
    },
    addSelectedItem (item) {
      if (Array.isArray(this.chips)) {
        this.chips.push(item)
      } else {
        this.chips = item
      }

      // this.$emit('update:openMenu', false)
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
</style>
