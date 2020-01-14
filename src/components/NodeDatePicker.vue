<template>
  <v-layout row wrap>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          :disabled="makeDisabled"
          flat
          :solo="makeDisabled"
          :label="makeDisabled ? label : ''"
          readonly
          :value="date"
          v-on="on"
          :prepend-inner-icon="makeDisabled ? '' : 'mdi-calendar'"
          color="secondary"
          required
          :rules="rules"
        >
        </v-text-field>
      </template>
      <v-date-picker
        locale="en-in"
        :max="maxDate"
        v-model="value"
        no-title
        @input="menu = false"
      ></v-date-picker>
    </v-menu>
  </v-layout>
</template>
<script>
export default {
  computed: {
    date () {
      var date = (this.value === null) ? this.label : this.value
      this.$emit('date', date)
      return date
    },
    /*
        gets todays date in YYYY-MM-DD format
        TODO: change to get date in NZ
      */
    maxDate () {
      var currentDate = new Date().toJSON().slice(0, 10).replace(/-/g, '-')
      return currentDate
    }
  },
  data () {
    return {
      menu: false,
      value: null
    }
  },
  props: {
    rules: {
      type: Array,
      required: false
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    makeDisabled: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>
