<template>
  <v-row>
    <v-col cols="12" class="text-h5">
        {{ t('storageTitle') }}
      </v-col>
    <v-col cols="12" md="8">
      <v-progress-linear
        :value="diskSpacePercentage"
        height="25"
        color="blue-grey"
      >
        <strong class="mr-2">{{ diskSpacePercentage }}%</strong>
        <span class="caption">C:</span>
      </v-progress-linear>
    </v-col>
    <v-col cols="12" md="8">
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <tr
              v-for="item in stats"
              :key="item.name"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.size }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
    <v-col cols="12">
      {{ t('storageManagementTitle' )}}
    </v-col>
    <v-col cols="12" class="ml-md-8">
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

export default {
  name: 'StorageSettings',
  data () {
    return {
      storageOption: 0,
      ahauLimit: 5,
      ahauDBStats: {
        size: 2486611008,
        hyperBlobStats: {
          size: 2158242485
        }
      },
      fileSystemStats: {
        size: 1000240963584,
        used: 15052365824,
        available: 583128702976,
        use: 2.52
      }
    }
  },
  computed: {
    stats () {
      return [
        { name: this.t('ahauStorageTitle'), size: this.ahauUsage },
        { name: this.t('diskStorageTitle'), size: this.diskSpaceAvailable }
      ]
    },
    diskSpaceAvailable () {
      return this.convertBytesToGb(this.fileSystemStats.available)
    },
    ahauUsage () {
      return this.convertBytesToGb(this.ahauDBStats.size)
    },
    diskSpacePercentage () {
      return ((this.fileSystemStats.available / this.fileSystemStats.size) * 100).toFixed(2)
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
