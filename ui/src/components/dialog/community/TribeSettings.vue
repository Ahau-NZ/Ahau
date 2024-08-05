<template>
  <v-container fluid>
    <v-row>
      <!-- Kaitiaki -->
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
      <ToggleBetaFeatures class="mt-4">
        <template>
          <v-col cols="12" class="overline">
            {{ t('credentialFeatures') }}
          </v-col>
          <v-col cols="12" style="cursor: pointer;">
            <v-text-field
              :value="tribeId"
              :append-icon="copyIcon"
              @click:append="copyCode"
              label="Copy your Tribe ID"
              style="max-width: 550px;"
            ></v-text-field>

          </v-col>
          <IssueCredentials :settings="settings" @change="emitCredChanges" />
          <AcceptCredentials :settings="settings" @change="emitCredChanges" class="mt-8" />
        </template>
      </ToggleBetaFeatures>
    </v-row>
  </v-container>
</template>

<script>
import ToggleBetaFeatures from './ToggleBetaFeatures.vue'
import AcceptCredentials from './AcceptCredentials.vue'
import IssueCredentials from './IssueCredentials.vue'

const COPY_ICON = 'mdi-content-copy'
const CHECK_ICON = 'mdi-check'

export default {
  name: 'TribeSettings',
  props: {
    tribeId: String,
    settings: Object
  },
  components: {
    ToggleBetaFeatures,
    AcceptCredentials,
    IssueCredentials
  },
  data () {
    return {
      copyIcon: COPY_ICON,
      credentialSettings: [
        {
          key: 'issuesVerifiedCredentials',
          label: d => this.t('issuesVerifiedCredentials', { toggle: this.getSwitchLabel(d) }),
          value: false // this.settings.issuesVerifiedCredentials TODO: update when ataprism in merged
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
    },
    emitCredChanges ({ key, value }) {
      console.log(key, value)
      this.$emit('change', { key, value })
    },
    async copyCode () {
      navigator.clipboard.writeText(this.tribeId)
        .then(() => {
          this.copyIcon = CHECK_ICON
          setTimeout(() => {
            this.copyIcon = COPY_ICON
          }, 2000)
        })
        .catch(err => {
          // This can happen if the user denies clipboard permissions:
          console.error('Could not copy text: ', err)
        })
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
