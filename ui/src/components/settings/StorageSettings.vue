<template>
  <v-row>
    <v-col cols="12" class="text-h5">
      {{ t('storageTitle') }}
    </v-col>

    <v-col cols="12" md="8">
      <div class="graph" :style="graphStyle">
        <div class='detail'>
          <strong class="mr-2">{{ fileSystemStats.use }}%</strong>
          <span class="mount">{{ fileSystemStats.mount }}</span>
        </div>
        <div class="other" />
        <div class="ahau" />
        <div class="free" />
      </div>
    </v-col>

    <v-col cols="12" md="8">
      <v-simple-table dense>
        <template v-slot:default>
          <tbody>
            <tr v-for="item in stats" :key="item.name" >
              <td><div :class='"key " + item.key' /></td>
              <td>{{ item.label }}</td>
              <td>{{ item.size }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>

    <v-col cols="12" class="ml-md-4 pt-0">
      <v-radio-group v-model="storageOption">
        <v-row>
          <!-- Keep all artefacts -->
          <v-radio @click="turnOffAutoPrune">
            <template v-slot:label>
              <strong>{{ t('defaultOption') }}</strong>
            </template>
          </v-radio>
          <v-col cols="12" :class="subtitleClass">
            {{ t('defaultOptionDescription') }}
          </v-col>
        </v-row>

        <v-row class="pt-4">
          <!-- Limit Disk Usage -->
          <v-radio @click="turnOnAutoPrune">
            <template v-slot:label>
              <strong>{{ t('limitOption') }}</strong>
            </template>
          </v-radio>
          <v-col cols="12" :class="subtitleClass">
            {{ t('limitOptionDescription') }}
          </v-col>

          <v-col cols="12">
            <v-slider
              v-if="storageOption === 0"
              value=100
              disabled

              min="0"
              max="100"

              inverse-label
              label="∞"

              color="#A80000"
              track-color="grey"
              class="pl-3"
            />
            <v-slider
              v-else
              v-model="ahauLimit"
              @mouseup="turnOnAutoPrune"
              min="0"
              max="100"

              inverse-label
              :label="`${t('ahauStorageLimit')} ${ahauLimit} GB`"

              color="#A80000"
              track-color="grey"
              class="pl-3"
            />
          </v-col>
        </v-row>
      </v-radio-group>
    </v-col>
  </v-row>
</template>

<script>
import gql from 'graphql-tag'
import { mapActions } from 'vuex'
const { startDelay: START_DELAY, intervalTime: INTERVAL_TIME } = require('ssb-hyper-blobs/lib/defaults').autoPrune

const GB = 1024 * 1024 * 1024

export default {
  name: 'StorageSettings',
  data () {
    return {
      config: null,
      storageOption: 0,
      ahauLimit: 5, // 5 GB
      ahauDBStats: {
        size: 0,
        hyperBlobStats: {
          size: 0
        }
      },
      fileSystemStats: {
        size: 0,
        use: 0,
        available: 0,
        used: 0,
        mount: ''
      },
      subtitleClass: 'pl-md-8 pr-md-10 pt-md-0 text-body-2 font-italic font-weight-light text-wrap'
    }
  },
  apollo: {
    ahauDBStats: {
      query: gql`
        query {
          ahauDBStats {
            size
            hyperBlobStats {
              size
            }
          }
        }
      `,
      fetchPolicy: 'no-cache'
    },
    fileSystemStats: {
      query: gql`
        query {
          fileSystemStats {
            size
            use
            available
            used
            mount
          }
        }
      `,
      fetchPolicy: 'no-cache'
    }
  },
  async created () {
    await this.reloadConfig()
  },
  watch: {
    config (config) {
      if (config === null) {
        this.storageOption = 0
        this.ahauLimit = 5
      } else if (typeof config === 'object') {
        this.storageOption = 1
        this.ahauLimit = Math.round(config.maxRemoteSize / GB)
      }
    }
  },
  computed: {
    stats () {
      return [
        {
          key: 'ahau',
          label: this.t('ahauStorageTitle'),
          size: this.ahauUsage
        },
        {
          key: 'free',
          label: this.t('diskStorageTitle'),
          size: this.diskSpaceAvailable
        }
      ]
    },
    graphStyle () {
      const ahau = this.ahauDBStats.size
      const other = this.fileSystemStats.used - ahau
      const free = this.fileSystemStats.available

      return {
        gridTemplateColumns: `${other}fr ${ahau}fr ${free}fr`
      }
    },
    diskSpaceAvailable () {
      return this.convertBytesToGb(this.fileSystemStats.available)
    },
    ahauUsage () {
      return this.convertBytesToGb(this.ahauDBStats.size)
    }
  },
  methods: {
    ...mapActions('settings', ['getAutoPruneConfig', 'updateAutoPrune', 'disableAutoPrune']),
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    },
    convertBytesToGb (bytes) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    },
    async turnOffAutoPrune () {
      await this.disableAutoPrune()
      await this.reloadConfig()
    },
    async turnOnAutoPrune () {
      var config = this.config
      if (config === null) {
        config = {
          startDelay: START_DELAY,
          intervalTime: INTERVAL_TIME
        }
      }

      // save the new value to the db along with the current config
      await this.updateAutoPrune({
        ...config,
        maxRemoteSize: this.ahauLimit * GB // convert to bytes
      })

      // update config
      await this.reloadConfig()
    },
    async reloadConfig () {
      this.config = await this.getAutoPruneConfig()
    }
  }
}
</script>

<style scoped lang="scss">
.other { background: rgba(95, 125, 139, 1); }
.ahau { background: var(--v-accent-base); }
.free { background: rgba(96, 125, 139, 0.3); }

.graph {
  display: grid;
  grid-template-rows: auto 10px;

  .detail {
    grid-column: 1 / 4;
  }
}

table {
  .key {
    width: 10px;
    height: 10px;
  }
}

</style>
