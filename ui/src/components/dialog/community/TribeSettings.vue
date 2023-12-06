<template>
  <v-container fluid >
    <v-row>
      <!-- Kaitiaki -->
      <v-col cols="12" class="overline">
        {{ t('credentialFeatures') }}
      </v-col>
      <v-col class="py-0 font-italic">
        {{ t('credentialFeaturesDescription') }}
      </v-col>
      <v-col cols="12" class="pl-5">
        <v-row v-for="(setting, i) in credentialSettings" :key="i" class="py-0">
          <v-col class="py-0">
            <v-switch
              v-model="setting.value"
              :label="setting.label(setting.value)"
              color="blue"
              class="py-0 switch"
              hide-details
              @change="emitChanges(setting.key, setting.value)"
            ></v-switch>
          </v-col>
          <v-spacer v-if="!mobile" class="py-0"/>
        </v-row>
      </v-col>
      <v-col cols="12" class="overline">
        {{ t('kaitiakiFeatures') }}
      </v-col>
      <v-col class="py-0 font-italic">
        {{ t('kaitiakiFeaturesDescription') }}
      </v-col>
      <v-col cols="12" class="pl-5">
        <v-row v-for="(setting, i) in kaitiakiSettings" :key="i" class="py-0">
          <v-col class="py-0">
            <v-switch
              v-model="setting.value"
              :label="setting.label(setting.value)"
              color="blue"
              class="py-0 switch"
              hide-details
              @change="emitChanges(setting.key, setting.value)"
            ></v-switch>
          </v-col>
          <v-spacer v-if="!mobile" class="py-0"/>
        </v-row>
      </v-col>

      <v-col cols="12" class="overline">
        {{ t('memberFeatures') }}
      </v-col>
      <v-col class="py-0 font-italic">
        {{ t('memberFeaturesDescription') }}
      </v-col>
      <v-col cols="12" class="pl-5">
        <v-row v-for="(setting, i) in memberSettings" :key="i" class="py-0">
          <v-col class="py-0">
            <v-switch
              v-model="setting.value"
              :label="setting.label(setting.value)"
              color="blue"
              class="py-0 switch"
              hide-details
              @change="emitChanges(setting.key, setting.value)"
            ></v-switch>
          </v-col>
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
      credentialSettings: [
        {
          key: 'issuesVerifiedCredentials',
          label: d => this.t('issuesVerifiedCredentials', { toggle: this.getSwitchLabel(d) }),
          value: this.settings.issuesVerifiedCredentials
        }
      ],
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
      return val === true ? this.t('on') : this.t('off')
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
.switch ::v-deep .v-label {
  font-size: 0.9rem
}
center {
  text-align: center;
}
</style>
