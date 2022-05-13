<template>
  <v-container fluid >
    <v-row>
      <v-col cols="12" class="text-h5">
        {{ t('kaitiakiFeatures') }}
      </v-col>
      <v-col :class="`${subtitleClass} py-0`">
        {{ t('kaitiakiFeaturesDescription') }}
      </v-col>
      <v-col cols="12" class="pl-10">
        <v-row v-for="(setting, i) in kaitiakiSettings" :key="i" class="py-0">
          <v-col class="py-0">
            <v-checkbox
              v-model="setting.value"
              :label="setting.label(setting.value)"
              color="blue"
              class="py-0"
              hide-details
              @change="emitChanges(setting.key, setting.value)"
            ></v-checkbox>
          </v-col>
          <v-spacer v-if="!mobile" class="py-0"/>
        </v-row>
      </v-col>

      <v-col cols="12" class="text-h5">
        {{ t('memberFeatures') }}
      </v-col>
      <v-col :class="`${subtitleClass} py-0`">
        {{ t('memberFeaturesDescription') }}
      </v-col>
      <v-col cols="12" class="pl-10">
        <v-row v-for="(setting, i) in memberSettings" :key="i" class="py-0">
          <v-col class="py-0">
            <v-checkbox
              v-model="setting.value"
              :label="setting.label(setting.value)"
              color="blue"
              class="py-0"
              hide-details
              @change="emitChanges(setting.key, setting.value)"
            ></v-checkbox>
          </v-col>
          <v-spacer v-if="!mobile" class="py-0"/>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'TribeSettings',
  props: {
    settings: Object
  },
  data () {
    return {
      subtitleClass: 'pl-md-8 pr-md-10 pt-md-0 text-body-2 font-italic font-weight-light text-wrap',
      kaitiakiSettings: [
        {
          key: 'allowPersonsList',
          label: d => this.t('allowPersonsList', { toggle: this.getSwitchLabel(d) }),
          value: this.settings.allowPersonsList
        }
      ],
      memberSettings: [
        {
          key: 'allowWhakapapaViews',
          label: d => this.t('allowWhakapapaViews', { toggle: this.getSwitchLabel(d) }),
          value: this.settings.allowWhakapapaViews
        },
        {
          key: 'allowStories',
          label: d => this.t('allowStories', { toggle: this.getSwitchLabel(d) }),
          value: this.settings.allowStories
        }
      ]
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    getSwitchLabel (val) {
      return val === true ? this.t('off') : this.t('on')
    },
    t (key, vars) {
      return this.$t('tribeSettings.' + key, vars)
    },
    emitChanges (key, value) {
      this.$emit('change', { key, value })
    }
  }
}
</script>
<style scoped>
center {
  text-align: center;
}
</style>
