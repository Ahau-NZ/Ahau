<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click.stop="$emit('update:searchFilter', true)" fab x-small color="#12355b">
          <v-icon> mdi-filter-variant </v-icon>
        </v-btn>
    </template>
    <span>{{ t('refine') }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'SearchFilterButton',
  methods: {
    t (key, vars) {
      return this.$t('whakapapaTable.' + key, vars)
    }
  }
}
</script>

<style scoped>

</style>
