<template>
  <v-row class="pb-16">
    <v-col cols="12" class="text-h5">
        {{ t('storageTitle') }}
      </v-col>
    <v-col cols="12" class="subtitle-2">
      {{ t('diskUsageTitle') }}
    </v-col>
    <v-col cols="8">
      <v-progress-linear
        :value="usage"
        height="25"
        color="blue-grey"
      >
        <strong class="mr-2">{{ Math.ceil(usage) }}%</strong>
        <span class="caption">C:</span>
      </v-progress-linear>
    </v-col>
    <v-col cols="12" class="subtitle-2">
      {{ t('ahauStorageTitle') }}:
      <span class="font-weight-bold">{{ ahauUsage }}mb</span>
    </v-col>
    <v-col>
      {{ t('defaultStorageOption' )}}
    </v-col>
    <v-col cols="12" class="ml-8">
      <v-radio-group v-model="storageOption" hide-details>
        <v-radio
          :label="t('default')"
        />
        <v-radio
          :label="t('excludeStorageOption')"
        />
        <v-radio
          :label="t('limitStorageOption')"
        />
      </v-radio-group>
    </v-col>
    <v-expand-transition>
      <div v-if="storageOption === 2">
        <v-col cols="12" class="subtitle-2 pl-16">
          {{ t('ahauStorageLimit') }}
          <span class="font-weight-bold">{{ ahauLimit }}mb</span>
        </v-col>
        <v-col cols="8" class="pl-16">
          <v-slider
            v-model="ahauLimit"
            max="30"
            min="1"
            hide-details
          />
        </v-col>
        <v-col cols="12" class="pl-16">
          {{ t('pruneStorageOption') }}
        </v-col>
      </div>
    </v-expand-transition>
  </v-row>
</template>

<script>

export default {
  name: 'StorageSettings',
  data () {
    return {
      storageOption: 0,
      usage: 55,
      ahauUsage: 300,
      ahauLimit: 5
    }
  },
  methods: {
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    }
  }
}
</script>
