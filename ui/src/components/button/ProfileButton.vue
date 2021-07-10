<template>
  <v-btn
    @click="$emit('click')"
    light
    :outlined="!mobile"
    :rounded="!mobile"
    :text="mobile"
  >
    <v-icon>{{ icon }}</v-icon>
    <span v-if="!mobile" class="pl-1">
      {{ label }}
    </span>
  </v-btn>
</template>
<script>
export default {
  props: {
    icon: String,
    label: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  method: {
    t (key, vars) {
      return this.$t('viewPerson.' + key, vars)
    }
  }
}

</script>
