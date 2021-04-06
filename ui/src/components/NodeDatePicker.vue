<template>
  <div>
    <fieldset
      :style="cssVars"
      :class="`custom-fieldset-${focused} ${readonly ? 'no-border' : 'rounded-input' }`"
      @mouseover="$emit('hover')"
      @mouseleave="$emit('hover')"
    >
      <legend :class="`custom-label ${readonly ? '' : 'ml-2'}`">
        {{ label }}
      </legend>
      <v-row>
        <v-col cols="3" :class="`${readonly ? '' : 'pl-6'} pr-0 py-0`">
          <v-select
            :items="days"
            ref="day"
            v-model="date.day"
            label="Day"
            @focus="focused == 'day'"
            @blur="focused == 'default'"
            @keydown.tab.prevent="onTab('day')"
            v-bind="customProps"

          ></v-select>
        </v-col>
        <v-col cols="5" class="px-4 py-0">
          <v-select
            :items="months"
            ref="month"
            v-model="date.month"
            label="Month"
            :light="isDark()"
            @focus="focused == 'month'"
            @blur="focused == 'default'"
            @keydown.tab.prevent="onTab('month')"
            v-bind="customProps"
          ></v-select>
        </v-col>
        <v-col cols="4" class=" pl-0 pr-6 py-0">
          <v-select
            :items="years"
            ref="year"
            v-model="date.year"
            label="Year"
            @focus="focused == 'year'"
            @blur="focused == 'default'"
            @keydown.tab.prevent="onTab('year')"
            v-bind="customProps"
          ></v-select>
        </v-col>
      </v-row>
      <v-row v-if="errorMsg">
        <v-col class="pa-0 pl-3">
          <legend class="custom-label">
            {{ errorMsg }}
          </legend>
        </v-col>
      </v-row>
    </fieldset>
  </div>
</template>
<script>
import edtf from 'edtf'
import { convertDateObjToString } from '@/lib/date-helpers.js'

export default {
  name: 'NodeDatePicker',
  props: {
    label: String,
    value: { type: [Date, String] },
    readonly: Boolean,
    min: { type: String },
    dark: Boolean,
    hasError: Boolean
  },
  data () {
    return {
      focused: 'default',
      date: {
        year: '',
        month: '',
        day: ''
      },
      minDate: {
        year: '',
        month: '',
        day: ''
      },
      theme: 'light',
      errorMsg: null,
      refDay: this.$refs.day,
      refMonth: this.$refs.month,
      refYear: this.$refs.year
    }
  },
  mounted () {
    this.dark ? (this.theme = 'dark') : (this.theme = 'light')
  },
  computed: {
    customProps () {
      return {
        hideDetails: true,
        class: 'customInput',
        placeholder: this.readonly ? ' ' : 'Select',
        appendIcon: this.readonly ? '' : undefined,
        readonly: this.readonly,
        menuProps: { bottom: true, offsetY: true, light: this.isDark() },
        light: this.isDark(),
        autoFocus: true
      }
    },
    cssVars () {
      return {
        '--custom-label':
          this.errorMsg || this.hasError
            ? 'red'
            : this.dark
              ? 'white'
              : '#858585',
        '--custom-fieldset-hover':
          this.errorMsg || this.hasError
            ? 'red'
            : this.dark
              ? 'white'
              : '#242424',
        '--custom-fieldset-focused':
          this.errorMsg || this.hasError
            ? 'red'
            : this.dark
              ? '#545454'
              : 'black',
        '--rounded-input-color':
          this.errorMsg || this.hasError
            ? 'red'
            : this.dark
              ? '#545454'
              : 'rgba(0,0,0,0.3)'
      }
    },
    // generates the years available to the user
    years () {
      // get the current year
      const max = new Date().getUTCFullYear()

      // make sure the years only up to the minimum allowed year (given as a prop)
      const min = this.minDate.year
      var maxYears = max - min + 1

      // array to return
      var years = [{ text: '', value: null }]

      // generates an array from 0 to max years
      Array(maxYears)
        .fill('')
        .forEach((v, i) => {
          // calculate the value of the current index e.g. (2020 - 0) = 2020, (2020 - 1) = 2019
          var val = max - i

          // if the current value is the current year
          if (val === max) {
            // only add that year and move on
            years.push({ value: val.toString(), text: val.toString() })
            return
          }

          var unspecified = this.unspecified(val)
          var normalized = this.normalize(val)

          if (unspecified) {
            years.push({ value: unspecified, text: unspecified })
          }

          years.push({ value: normalized, text: normalized })
        })

      // if there were more than one date, we can use a fully unspecified date too
      if (years.length > 1) years.push({ value: 'XXXX', text: 'XXXX' })

      return years
    },
    // generates an array of months
    months () {
      return [
        { text: '', value: null },
        { text: 'XX', value: 'XX' },
        { text: 'January', value: '01' },
        { text: 'February', value: '02' },
        { text: 'March', value: '03' },
        { text: 'April', value: '04' },
        { text: 'May', value: '05' },
        { text: 'June', value: '06' },
        { text: 'July', value: '07' },
        { text: 'August', value: '08' },
        { text: 'September', value: '09' },
        { text: 'October', value: '10' },
        { text: 'November', value: '11' },
        { text: 'December', value: '12' }
      ]
    },
    // generates an array of days
    days () {
      // the array to return will always have the unspecified option
      var days = [
        { value: null, text: '' },
        { value: 'XX', text: 'XX' }
      ]

      // generates a array of 31 indexes
      Array(32)
        .fill('')
        .forEach((v, i) => {
          // turns the current index into a double digit string e.g. 1 -> '01'
          var indexString = this.intToDDString(i)

          // make sure we dont add 0
          if (i === 0) return

          // if the number is not a multiple of 10
          if (i % 10 !== 0) {
            // it doesnt need an unspecified value
            days.push({ value: indexString, text: indexString })
            return
          }

          // otherwise, it does
          var newDay = (i / 10).toString() + 'X'
          days.push({ value: indexString, text: indexString })
          days.push({ value: newDay, text: newDay })
        })

      return days
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
    }
  },
  methods: {
    // on tab jump to next field
    isDark () {
      if (this.dark) {
        return false
      } else {
        return true
      }
    },
    onTab (e) {
      if (e === 'day') {
        this.$refs.month.focus()
        this.$refs.month.isMenuActive = true
      } else if (e === 'month') {
        this.$refs.year.focus()
        this.$refs.year.isMenuActive = true
      } else if (e === 'year') {
        this.$refs.year.blur()
      }
    },
    // turns an integer into a double digit string
    intToDDString (int) {
      if (int < 10) {
        return ('0' + int).toString()
      }
      return int.toString()
    },
    // turns an integer into a 4 digit string e.g. 1 => 0001
    fill (n) {
      n = n.toString()
      if (n.length === 4) return n
      if (n.length === 3) return '0' + n
      if (n.length === 2) return '00' + n
      if (n.length === 1) return '000' + n
      if (n.length === 0) return ''
    },
    normalize (n) {
      var sign = ''
      if (n < 0) {
        n *= -1
        sign = '-'
      }
      switch (true) {
        case n === 0:
          return '0000'
        case n < 10:
          return sign + this.fill(n)
        case n < 100:
          return sign + this.fill(n)
        case n < 1000:
          return sign + this.fill(n)
        default:
          return sign + n
      }
    },
    unspecified (n) {
      var sign = ''
      if (n < 0) {
        n *= -1
        sign = '-'
      }

      switch (true) {
        case n === 0:
          return 'XXXX'
        case n % 1000 === 0:
          return sign + (n / 1000 + 'XXX')
        case n % 100 === 0:
          return sign + this.fill(n / 100 + 'XX')
        case n % 10 === 0:
          return sign + this.fill(n / 10 + 'X')
        default:
          return null
      }
    }
  },
  watch: {
    date: {
      deep: true,
      handler (newValue) {
        try {
          var date = convertDateObjToString(newValue)
          this.errorMsg = null
          this.$emit('update:value', date)
        } catch (err) {
          this.errorMsg = err.message
        }
      }
    },
    value: {
      deep: true,
      immediate: true,
      handler (value) {
        if (value) {
          if (typeof value !== 'object') {
            try {
              value = edtf(value)
            } catch (err) {
              this.errorMsg = 'Please specify a valid date'
              return
            }
          }

          var str = value.edtf
          var date = str.split('-')

          if (str.charAt(0) === '-') {
            this.date.year = '-' + date[1]
            this.date.month = date[2]
            this.date.day = date[3]
          } else {
            this.date.year = date[0]
            this.date.month = date[1]
            this.date.day = date[2]
          }
        } else {
          this.date.year = ''
          this.date.month = ''
          this.date.day = ''
        }
      }
    },
    min: {
      deep: true,
      immediate: true,
      handler (value) {
        if (value) {
          if (typeof value !== 'object') {
            value = edtf(value)
          }

          var str = value.edtf
          var date = str.split('-')

          if (str.charAt(0) === '-') {
            this.minDate.year = '-' + date[1]
            this.minDate.month = date[2]
            this.minDate.day = date[3]
          } else {
            this.minDate.year = date[0]
            this.minDate.month = date[1]
            this.minDate.day = date[2]
          }
        } else {
          this.minDate.year = ''
          this.minDate.month = ''
          this.minDate.day = ''
        }
      }
    }
  }
}
</script>
<style lang="scss">
::-webkit-scrollbar {
  width: 12px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.__divider {
  padding-top: 0.75em;
  padding-bottom: 0.75em;
  pointer-events: none;
}

.rounded-input {
  border: 1px solid var(--rounded-input-color);
  border-radius: 4px;
}

.no-border {
  border-style: none;
}

.customInput.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.customInput.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}

.custom-label {
  font-size: 12px;
  margin-left: -3px;
  color: var(--custom-label);
  padding-left: 3px;
  padding-right: 3px;
}

.custom-fieldset-default:hover {
  border-color: var(--custom-fieldset-hover);
}

.custom-fieldset-focused {
  border-width: 2px;
  border-color: var(--custom-fieldset-focused);
  .custom-label {
    color: var(--custom-fieldset-focused);
  }
}

.custom-fieldset-readonly {
}
</style>
