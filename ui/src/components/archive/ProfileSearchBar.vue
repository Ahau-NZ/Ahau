<template>
  <div>
    <slot name="prepend-inner"></slot>
    <v-combobox
      v-model="chips"
      v-if="openMenu"
      :items="items"
      item-value="preferredName"
      multiple
      :menu-props="{ light: true, value: openMenu }"
      hide-selected
      append-icon=""
      placeholder=" "
      hide-details
      dense
      outlined
      deletable-chips
      :searchInput.sync="searchInput"
      @blur.native="$emit('hide')"

    >
      <!-- <template v-slot:selection="data"> -->
        <!-- <v-chip
          :key="JSON.stringify(data.item)"
          v-bind="data.attrs"
          :input-value="data.selected"
          :disabled="data.disabled"
          @click:close="data.parent.selectItem(data.item)"
          large
          color="white"
        > -->
          <!-- <Avatar size="50px" class="mr-3"
            show-label
            :image="data.item.avatarImage"
            :alt="data.item.preferredName"
            :gender="data.item.gender"
            :bornAt="data.item.bornAt"
          />
      </template> -->
      <template v-slot:selection="data">
      </template>
      <template v-slot:item="data">
        <template v-if="typeof data.item === 'object'">
          <v-list-item @click="addSelectedItem(data.item)">
            <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :bornAt="data.item.bornAt" />
            <!-- <v-list-item-content>
              <v-list-item-title> {{ data.item.preferredName }} </v-list-item-title>
              <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
            </v-list-item-content> -->
            <v-list-item-content>
              <v-list-item-title> {{ data.item.legalName ? data.item.legalName :  '&nbsp;' }} </v-list-item-title>
              <!-- <v-list-item-subtitle>Legal name</v-list-item-subtitle> -->
            </v-list-item-content>
            <!-- <v-list-item-action>
              <v-list-item-title> {{ age(data.item.profile.bornAt) }} </v-list-item-title>
              <v-list-item-subtitle>Age</v-list-item-subtitle>
            </v-list-item-action> -->
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
      type: Array,
      default () {
        return []
      }
    },
    items: {
      type: Array,
      default () {
        return []
      }
    }
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
    addSelectedItem (item) {
      this.chips.push(item)
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
</style>
