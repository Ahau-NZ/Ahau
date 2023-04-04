<template>
  <v-col :cols="mobile ? smCols : '12'" :sm="smCols" :md="mdCols">
    <v-row>
      <v-col v-if="title" class=" ma-0 profile-label overline pt-0"><small>{{ title }}</small></v-col>
    </v-row>
    <v-row v-if="value" class="justify-center px-2 pb-6">
      <p class="ma-0 profile-info">
        <span v-for="(line, index) in formatValue(value)" :key="index">{{line}}<br></span>
      </p>
    </v-row>
    <v-row v-if="subValue" class="justify-center">
      <p class="ma-0 profile-info"><small>{{ subValue }}</small></p>
    </v-row>
  </v-col>
</template>

<script>

export default {
  name: 'ProfileInfoItem',
  props: {
    title: String,
    value: [String, Number, Array],
    subValue: String,
    smCols: {
      type: String,
      default: '6'
    },
    mdCols: {
      type: String,
      default: '3'
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    formatValue (value) {
      if (Array.isArray(value)) {
        return value.join(', ')
      }

      // NOTE: not sure why we need this
      return value.split('\n')
    }
  }
}
</script>

<style>
.profile-label {
  color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
}
</style>
