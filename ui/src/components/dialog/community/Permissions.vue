<template>
<v-col cols="12">
  <p class="mb-5 black--text">{{ t('tribalPermissions') }}</p>
  <v-col :class="mobile ? 'pa-4 black--text':'ml-10 black--text'" style="background-color:#ebebeb80;">
    <v-row>
      <v-col class="pt-0" cols=6 md=4>
        <p>{{ t('createWhakapapas') }}</p>
      </v-col>
      <v-col cols=6 md=4 class=" pt-0 mt-n5">
        <v-select
          disabled
          :items="roles"
          v-model="permission.whakapapa"
          v-bind="customProps"
        >
        </v-select>
      </v-col>
    </v-row>
    <v-row class="pt-4">
      <v-col class="pt-0" cols=6 md=4>
        <p>{{ t('createCollections') }}</p>
      </v-col>
      <v-col cols=6 md=4 class=" pt-0 mt-n5">
        <v-select
          disabled
          :items="roles"
          v-model="permission.collections"
          v-bind="customProps"
        >
        </v-select>
      </v-col>
    </v-row>
    <v-row class="pt-4">
      <v-col class="pt-0" cols=6 md=4>
        <p>{{ t('createStories') }}</p>
      </v-col>
      <v-col cols=6 md=4 class=" pt-0 mt-n5">
        <v-select
          disabled
          :items="roles"
          v-model="permission.stories"
          v-bind="customProps"
          >
        </v-select>
      </v-col>
    </v-row>
  </v-col>
</v-col>
</template>
<script>

export default {
  name: 'Permissions',
  props: {
    mobile: Boolean
  },
  data () {
    return {
      roles: ['Kaitiaki only', 'All members'],
      permission: {
        whakapapa: 'Kaitiaki only',
        collections: 'Kaitiaki only',
        stories: 'All members'
      }
    }
  },
  computed: {
    customProps () {
      return {
        hideDetails: true,
        menuProps: { bottom: true, offsetY: true, light: true },
        light: true,
        autoFocus: true
      }
    }
  },
  methods: {
    t (key, vars) {
      return this.$t('addCommunityForm.' + key, vars)
    }
  }
}
</script>
<style scoped>

p {
  color: black
}

</style>
