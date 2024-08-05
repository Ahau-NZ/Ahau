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
          <v-col cols="12" style="cursor: pointer;" v-if="currentTribe">
            <v-text-field
              :value="currentTribe.id"
              :append-icon="copyTribeId"
              @click:append="copyCode(currentTribe.id, 'copyTribeId')"
              label="Copy your Tribe ID"
              style="max-width: 550px;"
              readonly
            ></v-text-field>
          </v-col>
          <IssueCredentials :settings="settings" @change="emitCredChanges" />
          <AcceptCredentials :settings="settings" @change="emitCredChanges" class="mt-8" />
          <v-col cols="12" v-if="recommendedConfig">
            <v-textarea
              label="Copy recommended config"
              :value="recommendedConfig"
              :append-icon="copyConfig"
              @click:append="copyCode(recommendedConfig, 'copyConfig')"
              readonly
              auto-grow
            />
          </v-col>
        </template>
      </ToggleBetaFeatures>
    </v-row>
  </v-container>
</template>

<script>
import ToggleBetaFeatures from './ToggleBetaFeatures.vue'
import AcceptCredentials from './AcceptCredentials.vue'
import IssueCredentials from './IssueCredentials.vue'
import { mapGetters } from 'vuex'

const COPY_ICON = 'mdi-content-copy'
const CHECK_ICON = 'mdi-check'

export default {
  name: 'TribeSettings',
  props: {
    settings: Object
  },
  components: {
    ToggleBetaFeatures,
    AcceptCredentials,
    IssueCredentials
  },
  data () {
    return {
      copyTribeId: COPY_ICON,
      copyConfig: COPY_ICON,
      recommendedConfig: null,
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
  async mounted () {
    await this.getConfig()
  },
  computed: {
    ...mapGetters('tribe', ['currentTribe', 'tribeProfile']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    config () {
      if (!this.currentTribe) return null

      return JSON.stringify(this.recommendedConfig, null, 2)
    }
  },
  methods: {
    async getConfig () {
      const config = await window.ahoy?.getConfig()

      const atalaConfig = config?.atalaPrism || {}

      // get the issuer config
      let issuerConfig = Object.assign({}, atalaConfig.issuers)
      if (this.settings.issuesVerifiedCredentials) {
        issuerConfig = Object.assign({}, issuerConfig, {
          [this.currentTribe.id]: {
            tribeName: this.tribeProfile.preferredName,
            ISSUER_URL: 'https://your.agent.address/prism-agent/',
            ISSUER_APIKEY: 'yourApiKey'
          }
        })
      }

      // get the verifier config
      let verifierConfig = Object.assign({}, atalaConfig.verifiers)
      if (this.settings.acceptsVerifiedCredentials) {
        verifierConfig = Object.assign({}, verifierConfig, {
          [this.currentTribe.id]: {
            tribeName: this.tribeProfile.preferredName,
            VERIFIER_URL: 'https://your.agent.address/prism-agent/',
            VERIFIER_APIKEY: 'yourApiKey'
          }
        })
      }

      this.recommendedConfig = JSON.stringify({
        atalaPrism: Object.assign(
          {},
          atalaConfig,
          {
            verifiers: verifierConfig,
            issuers: issuerConfig
          }
        )
      }, null, 2)
    },
    getSwitchLabel (val) {
      return val === true ? this.t('on') : this.t('off')
    },
    t (key, vars) {
      return this.$t('tribeSettings.' + key, vars)
    },
    async emitChanges (key, value) {
      this.$emit('change', { key, value })
      await this.getConfig()
    },
    async emitCredChanges ({ key, value }) {
      this.$emit('change', { key, value })
      await this.getConfig()
    },
    async copyCode (text, name) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this[name] = CHECK_ICON
          setTimeout(() => {
            this[name] = COPY_ICON
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
