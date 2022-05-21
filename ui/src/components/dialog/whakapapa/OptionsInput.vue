<template>
  <div>
    <v-divider />
    <v-row @click="show = !show" class="pointer">
      <v-col align="start">
        <v-row class="pl-2">
          <v-icon :class="active ? 'blue--text':''" small >mdi-database-cog-outline</v-icon>
          <span :class="active ? 'blue--text':''" class="pa-0 ma-0 pl-2">{{ t('view') }}:</span>
          <div v-if="active">
            <span class="blue--text pa-0 ma-0 pl-2"></span>
          </div>
        </v-row>
      </v-col>
      <v-btn icon right>
        <v-icon class="pt-3">{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-row>
    <v-expand-transition>
      <div v-show="show">
        <v-list-item>
          <v-list-item-title>show all</v-list-item-title>
          <v-list-item-action>
            <v-checkbox
              v-model="showAll"
              color="accent-4"
              :disabled="showAll"
            ></v-checkbox>
          </v-list-item-action>
        </v-list-item>
        <v-divider></v-divider>
        <v-list>
          <v-list-item-group>
            <template v-for="(item, i) in headers">
              <v-list-item
                v-if="item.text"
                :key="`item-${i}`"
                :value="item"
              >
                <template v-slot>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.text"></v-list-item-title>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-checkbox
                      v-model="item.show"
                      color="accent-4"
                    ></v-checkbox>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </template>
          </v-list-item-group>
        </v-list>
      </div>
    </v-expand-transition>
    <v-divider />
  </div>
</template>

<script>

export default {
  name: 'OptionsInput',
  components: {

  },
  props: {
    reset: Boolean,
    isList: Boolean,
    headers: Array
  },
  data () {
    return {
      active: null,
      show: false
    }
  },
  computed: {
    showAll: {
      get () {
        return !this.headers?.some(header => !header.show)
      },
      set (newValue) {
        if (newValue) {
          this.headers.forEach(header => { header.show = true })
        }
      }
    }
  },
  methods: {
    updateSwitch (event) {
      console.log(event)
    },
    t (key, vars) {
      return this.$t('whakapapaTable.' + key, vars)
    }
  }
}
</script>

<style lang="scss">

.pointer {
  cursor: pointer;
}

.v-list-item--active.no-active::before {
  opacity: 0 !important;
}

</style>
