<template>
  <div>
    <v-divider />
    <v-row @click="show = !show" class="pointer" disabled>
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
        <v-tooltip bottom open-delay="700">
          <template v-slot:activator="{ on }">
            <div v-on="on">
              <v-list>
                <v-list-item>
                  <v-select
                    :items="selections"
                    v-model="option"
                    outlined
                    dense
                    hide-details
                    placeholder="show all"
                    :menu-props="{light: true}"
                    disabled
                  ></v-select>
                </v-list-item>
                <v-list-item-group v-model="model">
                  <v-list-item
                    v-for="(item, i) in items"
                    :key="i"
                    :value="item.value"
                    active-class="no-active"
                    disabled
                    @click="updateSwitch({value: item.value, type: item.type})"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        style="font-size:smaller"
                        align="start"
                        v-text="item.text"
                      >
                      </v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-checkbox disabled dense v-model="item.value" class="mt-0"></v-checkbox>
                    </v-list-item-action>

                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </div>
          </template>
          <span> {{ $t('support.comingSoon') }} </span>
        </v-tooltip>
      </div>
    </v-expand-transition>
    <v-divider />
  </div>
</template>

<script>

export default {
  name: 'OptionstInput',
  components: {

  },
  props: {
    reset: Boolean
  },
  data () {
    return {
      model: null,
      option: null,
      active: null,
      show: false,
      selections: ['hide all', 'show all'],
      items: [
        { text: this.t('name'), type: 'preferredName', value: true },
        { text: this.t('fullName'), type: 'legalName', value: true },
        { text: this.t('knownAs'), type: 'altNames', value: true },
        { text: this.t('dateofbirth'), type: 'dob', value: true },
        { text: this.t('dateofdeath'), type: 'dod', value: true },
        { text: this.t('profession'), type: 'profession', value: true },
        { text: this.t('address'), type: 'address', value: true },
        { text: this.t('city'), type: 'city', value: true },
        { text: this.t('postcode'), type: 'postocde', value: true },
        { text: this.t('country'), type: 'country', value: true },
        { text: this.t('placeofbirth'), type: 'pob', value: true },
        { text: this.t('placeofdeath'), type: 'pod', value: true },
        { text: this.t('email'), type: 'email', value: true },
        { text: this.t('phone'), type: 'phone', value: true },
        { text: this.t('showAncestors'), type: 'ancestors', value: true },
        { text: this.t('showWhakapapa'), type: 'whakapapa', value: true }
      ]
    }
  },
  watch: {
    option (newVal) {
      if (newVal === 'hide all') {
        this.items.map(item => {
          if (item.type === 'preferredName' || item.type === 'legalName') return
          item.value = false
        })
      } else if (newVal === 'show all') {
        this.items.map(item => {
          item.value = true
        })
      }
    }
  },
  computed: {

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
