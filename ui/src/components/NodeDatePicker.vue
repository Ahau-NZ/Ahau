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
        reactive
        locale="en-in"
        :max="maxDate"
        min="0000-01-01"
        v-model="updatedValue"
        no-title
        hide-details
        light
        ref="picker"
        show-current="false"
      >
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
      <v-btn text color="primary" @click="menu = false">OK</v-btn>
      </v-date-picker>
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

      return `${this.getOrdinalNum(myDate.getDate())} of ${MONTHS[myDate.getMonth()]} ${myDate.getFullYear()}`
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
  methods: {
    getOrdinalNum (n) {
      return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '')
    }
  },
  watch: {
    value (newValue) {
      this.updatedValue = newValue
    },
    menu (val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  }
}
</script>
<style>
::-webkit-scrollbar {
  width:12px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

</style>
