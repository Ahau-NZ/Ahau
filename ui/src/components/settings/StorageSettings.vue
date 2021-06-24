<template>
  <v-row>
    <v-col cols="12" class="text-h5">
      {{ t('storageTitle') }}
    </v-col>

    <v-col cols="12" md="8">
      <div class='graph' :style='graphStyle'>
        <div class='detail'>
          <strong class="mr-2">{{ fileSystemStats.use }}%</strong>
          <span class="mount">{{ fileSystemStats.mount }}</span>
        </div>
        <div class='other' />
        <div class='ahau' />
        <div class='free' />
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

    <v-col cols="12">
      {{ t('storageManagementTitle' )}}
    </v-col>

    <v-col cols="12" class="ml-md-8 pt-0">
        <!-- <v-radio
          :label="t('defaultOption')"
        />
        <v-col cols="12" class="pl-16 font-italic">
          {{ t('defaultOptionDescription') }}
        </v-col> -->
        <v-radio-group v-model="storageOption">
          <v-radio
            :label="t('limitOption')"
          />
        </v-radio-group>
        <v-col cols="12" class="pl-md-16 font-italic">
          {{ t('pruneStorageOption') }}
        </v-col>
        <v-col cols="12" class="subtitle-2 pl-md-16 font-italic">
          {{ t('ahauStorageLimit') }}
          <span>{{ ahauLimit }} GB</span>
        </v-col>
    </v-col>
  </v-row>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'StorageSettings',
  data () {
    return {
      storageOption: 0,
      ahauLimit: 5,
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
      }
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
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    },
    convertBytesToGb (bytes) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
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
