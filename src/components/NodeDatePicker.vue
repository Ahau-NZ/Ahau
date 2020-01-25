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
          v-on="on"
          :rules="rules"
          :label="label"
          :placeholder="' '"
          :value="date"
          :disabled="makeDisabled"
          readonly
          flat
          :solo="makeDisabled"
          :prepend-inner-icon="makeDisabled ? '' : 'mdi-calendar'"
          :append-icon="makeDisabled ? '' : 'mdi-chevron-down'"
          :hide-details="true"
        ></v-text-field>
      </template>
      <v-date-picker
        locale="en-in"
        :max="maxDate"
        v-model="updatedValue"
        no-title
        @input="menu = false"
        hide-details
      ></v-date-picker>
    </v-menu>
  </v-layout>
</template>
<script>
export default {
  computed: {
    date () {
      var date = (this.updatedValue === null)
        ? this.value
        : this.updatedValue
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
      updatedValue: null
    }
  },
  props: {
    rules: Array,
    label: String,
    value: { type: String, default: ' ' },
    makeDisabled: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>
