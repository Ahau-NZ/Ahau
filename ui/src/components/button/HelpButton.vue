<template>
  <v-tooltip bottom>
      <template v-slot:activator="{ on }">
          <v-btn  href="https://chat.ahau.io/channel/help" target="_blank" x-small v-on="on" fab  color="#b12526">
            <v-icon light>mdi-message-alert</v-icon>
          </v-btn>
      </template>
      <span>{{ t('help') }}</span>
    </v-tooltip>
</template>
<script>
export default {
  methods: {
    t (key, vars) {
      return this.$t('button.' + key, vars)
    }
  }
}
</script>
