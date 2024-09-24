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
          <IssueCredentials :settings="settings" @change="emitCredChanges" />
          <AcceptCredentials :settings="settings" @change="emitCredChanges" class="mt-8" />

          <v-col cols="12" class="overline mt-4">
            {{ t('configuration') }}
          </v-col>
          <!-- Configuration Helpers -->
          <v-col class="py-0 font-italic">
            {{ t('configHelpText') }}
          </v-col>
          <v-col cols="12" style="cursor: pointer;" v-if="currentTribe">
            <v-text-field
              :value="currentTribe.id"
              :append-icon="copyTribeId"
              @click:append="copyCode(currentTribe.id, 'copyTribeId')"
              :label="t('copyTribeId')"
              style="max-width: 550px;"
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12" style="cursor: pointer;" v-if="configPath">
            <v-text-field
              :value="configPath"
              :append-icon="copyPath"
              @click:append="copyCode(configPath, 'copyPath')"
              :label="t('copyPath')"
              style="max-width: 550px;"
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12" v-if="recommendedConfig">
            <v-textarea
              :label="t('copyConfig')"
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
import { isEmpty } from 'lodash-es'
import path from 'path'

const COPY_ICON = 'mdi-content-copy'
const CHECK_ICON = 'mdi-check'

const LOCAL_ISSUER_EXAMPLE = 'http://localhost:8000/cloud-agent'
const LOCAL_VERIFIER_EXAMPLE = 'http://localhost:9000/cloud-agent'
const API_KEY_EXAMPLE = 'my-api-key'

const ALLOW_PERSON_LIST = 'allowPersonsList'
const ALLOW_WHAKAPAPA_VIEWS = 'allowWhakapapaViews'
const ALLOW_STORIES = 'allowStories'

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
      copyPath: COPY_ICON,
      config: {},
      kaitiakiSettings: [
        {
          key: ALLOW_PERSON_LIST,
          label: d => this.t(ALLOW_PERSON_LIST, { toggle: this.getSwitchLabel(d) }),
          value: this.settings.allowPersonsList
        }
      ],
      memberSettings: [
        {
          key: ALLOW_WHAKAPAPA_VIEWS,
          label: d => this.t(ALLOW_WHAKAPAPA_VIEWS, { toggle: this.getSwitchLabel(d) }),
          value: this.settings.allowWhakapapaViews
        },
        {
          key: ALLOW_STORIES,
          label: d => this.t(ALLOW_STORIES, { toggle: this.getSwitchLabel(d) }),
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
    atalaConfig () {
      if (!this.currentTribe?.id || isEmpty(this.config)) return {}

      const atalaConfig = this.config?.atalaPrism

      // get the issuer config
      let issuerConfig = Object.assign({}, atalaConfig.issuers)

      if (this.settings.issuesVerifiedCredentials && !issuerConfig[this.currentTribe.id]) {
        issuerConfig = Object.assign({}, issuerConfig, {
          [this.currentTribe.id]: {
            tribeName: this.tribeProfile.preferredName,
            ISSUER_URL: LOCAL_ISSUER_EXAMPLE,
            ISSUER_APIKEY: API_KEY_EXAMPLE
          }
        })
      }

      // get the verifier config
      let verifierConfig = Object.assign({}, atalaConfig.verifiers)

      if (this.settings.acceptsVerifiedCredentials && !verifierConfig[this.currentTribe.id]) {
        verifierConfig = Object.assign({}, verifierConfig, {
          [this.currentTribe.id]: {
            tribeName: this.tribeProfile.preferredName,
            VERIFIER_URL: LOCAL_VERIFIER_EXAMPLE,
            VERIFIER_APIKEY: API_KEY_EXAMPLE
          }
        })
      }

      return {
        atalaPrism: Object.assign(
          {},
          atalaConfig,
          {
            verifiers: verifierConfig,
            issuers: issuerConfig
          }
        )
      }
    },
    recommendedConfig () {
      if (isEmpty(this.atalaConfig)) return null

      return JSON.stringify(this.atalaConfig, null, 2)
    },
    configPath () {
      if (isEmpty(this.config)) return null

      return path.join(this.config?.path, 'config')
    }
  },
  methods: {
    async getConfig () {
      this.config = await window.ahoy?.getConfig()
      console.log(this.config)
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
