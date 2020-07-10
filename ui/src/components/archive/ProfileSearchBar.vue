<template>
<div style="width: 300px">
    <v-combobox
      v-if="openMenu" 
      v-model="chips" 
      id="combobox"
       ref="combobox" 
       :items="items" 
       item-value="id" 
       :item-text="item" 
       :multiple="!single" 
       :menu-props="{ light: true, value: openMenu }" 
       hide-selected append-icon="mdi-close" 
       @click:append="close" 
       :placeholder="placeholder" 
       no-data-text="no suggestions found" 
       hide-details dense rounded outlined 
       :searchInput.sync="searchInput" 
       :autofocus="openMenu" 
       @blur="close" 
       class="search-input" 
      >
        <template v-slot:selection="{}">
        </template>
        <template v-slot:item="{ item }">
            <!-- MENTIONS + CONTRIBUTORS + CREATOR -->
            <template v-if="type === 'profile'">
                <v-list-item @click="addSelectedItem(item)">
                    <Avatar class="mr-3" size="40px" :image="item.avatarImage" :alt="item.preferredName" :gender="item.gender" :aliveInterval="item.aliveInterval" />
                    <v-list-item-content>
                        <v-list-item-title> {{ item.preferredName }} </v-list-item-title>
                        <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content>
                        <v-list-item-title> {{ item.legalName ? item.legalName :  '&nbsp;' }} </v-list-item-title>
                        <v-list-item-subtitle>Legal name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-list-item-title> {{ age(item.aliveInterval) }} </v-list-item-title>
                        <v-list-item-subtitle>Age</v-list-item-subtitle>
                    </v-list-item-action>
                </v-list-item>
            </template>

            <!-- ACCESS -->
            <template v-else-if="type === 'commuinty'">
                <v-list-item @click="addSelectedItem(item)">
                    <Avatar class="mr-3" size="40px" :image="item.avatarImage" :alt="item.preferredName" :gender="item.gender" :aliveInterval="item.aliveInterval" />
                    <v-list-item-content>
                        <v-list-item-title> {{ item.preferredName }} </v-list-item-title>
                        <v-list-item-subtitle>Community name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-list-item-title> {{ age(item.aliveInterval) }} </v-list-item-title>
                        <v-list-item-subtitle>Members</v-list-item-subtitle>
                    </v-list-item-action>
                </v-list-item>
            </template>

            <!-- RELATED RECORDS + COLLECTIONS -->
            <template v-else-if="type === 'collection'">
                <v-list-item @click="addSelectedItem(item)">
                    <v-list-item-avatar tile left>
                        <v-img v-if="getImage(item)" :src="getImage(item)">
                        </v-img>
                        <v-icon v-else x-large>mdi-book-open</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ item.title || 'Untitled Record' }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>

            <!-- CATEGORIES -->
            <template v-else>
                <v-list-item @click="addSelectedItem(item)">
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
        placeholder: {
            type: String,
            default: ' '
        }
    },
    data() {
        return {
            chips: [],
            searchInput: "",
            parentElement: null,
            childElement: null,
            disableFocus: false
        }
    },
    components: {
        Avatar
    },
    computed: {
        mobile() {
            return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
        }
    },
    watch: {
        selectedItems: {
            deep: true,
            immediate: true,
            handler(newValue, oldValue) {
              if (oldValue && oldValue.length > newValue.length) {
                return this.chips = oldValue
              } else {
                  this.chips = newValue
              }
            }
        },
        chips: {
            deep: true,
            handler(newValue) {
                this.$emit('update:selectedItems', newValue)
            }
        },
        searchInput(newValue) {
            if (!newValue) return
            if (newValue.length > 2) {
                this.$emit('getSuggestions', newValue)
            } else {
                this.clearSuggestions()
            }
        }
    },
    methods: {
        getImage(item) {
            const {
                artefacts
            } = item

            if (artefacts && artefacts.length > 0) {
                // still in link format
                var artefact = artefacts[0].artefact
                if (artefact.type === 'photo') return artefact.uri
            }

            return null
        },
        clearSuggestions() {
            this.$emit('getSuggestions', null)
        },
        age(aliveInterval) {
            return calculateAge(aliveInterval)
        },
        close() {
          console.log
            this.$emit('update:openMenu', false)
            this.clearSuggestions()
        },
        open() {
            return true
        },
        addSelectedItem(item) {
            if (Array.isArray(this.chips)) {
                this.chips.push(item)
            } else {
                this.chips = item
            }
            this.$emit('update:openMenu', false)
        },
        removeSelectedItem(item) {
          console.log("remove chip")
            this.chips.slice(item, 1)
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
</style>
