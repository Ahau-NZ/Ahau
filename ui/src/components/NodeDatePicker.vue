<template>
  <div>
    <fieldset :class="`rounded-input ${customClass}`">
      <legend class="ml-2 custom-label">
        {{label}}
      </legend>
        <v-row>
          <v-col class="pa-0 pl-6">
            <v-autocomplete
              ref="day"
              v-model="date.day"
              hide-no-data
              :items="days"
              label="Day"
              placeholder="DD"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
              auto-select-first
            ></v-autocomplete>
          </v-col>
          <v-col class="pa-0">
            <v-autocomplete
              ref="month"
              v-model="date.month"
              hide-no-data
              :items="months"
              label="Month"
              placeholder="MM"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
              auto-select-first
            ></v-autocomplete>
          </v-col>
          <v-col class="pa-0 pr-3">
            <v-autocomplete
              ref="year"
              v-model="date.year"
              hide-no-data
              :items="years"
              label="Year"
              placeholder="YYYY"
              v-bind="customProps"
              @focus="focused = true"
              auto-select-first
              @blur="focesd = false"
            >
            </v-autocomplete>
          </v-col>
        </v-row>
    </fieldset>
  </div>
</template>
<script>
import edtf from 'edtf'

export default {
  name: 'NodeDatePicker',
  props: {
    label: String,
    value: { type: [Date, String], default: 'XXXX-XX-XX' },
    readonly: { type: Boolean, default: false },
    min: { type: String }
  },
  data () {
    return {
      focused: false,
      date: {
        year: '',
        month: '',
        day: ''
      },
      minDate: {
        year: '',
        month: '',
        day: ''
      }
    }
  },
  computed: {
    customProps () {
      return {
        hideDetails: true,
        class: 'customInput',
        flat: true,
        hideNoData: true,
        appendIcon: '',
        readonly: this.readonly,
        menuProps: { light: true },
        light: true
      }
    },
    customClass () {
      return this.focused ? 'custom-fieldset-focused' : 'custom-fieldset-default'
    },
    // generates the years available to the user
    years () {
      // get the current year
      const max = new Date().getUTCFullYear()

      // make sure the years only up to the minimum allowed year (given as a prop)
      const min = this.minDate.year
      var maxYears = (max - min) + 1

      // array to return
      var years = [
        { text: '', value: '' }
      ]

      // generates an array from 0 to max years
      Array(maxYears).fill('').forEach((v, i) => {
        // calculate the value of the current index e.g. (2020 - 0) = 2020, (2020 - 1) = 2019
        var val = (max - i)

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
        { text: '', value: '' },
        { text: 'XX', value: 'XX' },
        { text: '01', value: '01' },
        { text: '02', value: '02' },
        { text: '03', value: '03' },
        { text: '04', value: '04' },
        { text: '05', value: '05' },
        { text: '06', value: '06' },
        { text: '07', value: '07' },
        { text: '08', value: '08' },
        { text: '09', value: '09' },
        { text: '10', value: '10' },
        { text: '11', value: '11' },
        { text: '12', value: '12' }
      ]
    },
    // generates an array of days
    days () {
      // the array to return will always have the unspecified option
      var days = [
        { value: '', text: '' },
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
        var year = this.date.year || ''
        var month = this.date.month || ''
        var day = this.date.day || ''

        if (year && month && day) {
          this.$emit('update:value', `${year}-${month}-${day}`)
        } else if (year && month && !day) {
          this.$emit('update:value', `${year}-${month}`)
        } else if (year && !month && !day) {
          this.$emit('update:value', year)
        } else {
          this.$emit('update:value', '')
        }
      }
    },
    value: {
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
.__divider {
  padding-top: 0.75em;
  padding-bottom: 0.75em;
  pointer-events: none;
}

.rounded-input {
  border: 1px solid rgba(0,0,0,0.3);
  border-radius: 4px;
}

.customInput.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.customInput.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}

.custom-label {
  font-size: 12px;
  margin-left: 8px;
  color: #858585;
  padding-left: 3px;
  padding-right: 3px;
}

.custom-fieldset-default:hover {
  border-color: #242424;
}

.custom-fieldset-focused {
  border-width: 2px;
  border-color: black;
  .custom-label {
    color: black;
  }
}
</style>
