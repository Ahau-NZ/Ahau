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
          v-on="readonly ? null : on"
          :rules="rules"
          :label="label"
          placeholder=" "
          :value="date"
          readonly
          flat
          :hide-details="true"
          :class="getClass"
          :clearable="!readonly"
        ></v-text-field>
      </template>
      <v-date-picker
        locale="en-in"
        :max="maxDate"
        v-model="updatedValue"
        no-title
        @input="menu = false"
        hide-details
        light
      ></v-date-picker>
    </v-menu>
  </v-layout>
</template>
<script>
import { MONTHS } from '../lib/constants'
export default {
  name: 'NodeDatePicker',
  props: {
    rules: Array,
    label: String,
    value: { type: String },
    readonly: { type: Boolean, default: false }
  },
  computed: {
    date () {
      var date = this.updatedValue === null ? this.value : this.updatedValue
      this.$emit('date', date)

      if (!date) return date

      var myDate = new Date(date)

      return `${myDate.getDate()} ${MONTHS[myDate.getMonth()]} ${myDate.getFullYear()}`
    },
    /*
        gets todays date in YYYY-MM-DD format
        TODO: change to get date in NZ
      */
    maxDate () {
      var currentDate = new Date()
        .toJSON()
        .slice(0, 10)
        .replace(/-/g, '-')
      return currentDate
    },
    getClass () {
      return this.readonly ? 'custom ml-3 mr-3' : 'ml-3 mr-3'
    }
  },
  data () {
    return {
      menu: false,
      updatedValue: null,
      on: false
    }
  },
  watch: {
    value (newValue) {
      this.updatedValue = newValue
    }
  }
}
</script>
