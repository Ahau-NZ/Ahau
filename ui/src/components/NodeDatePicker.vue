<template>
  <div>
    <fieldset :class="`rounded-border ${customClass}`">
      <legend class="ml-2 custom-label">
        Date of birth
      </legend>
        <v-row>
          <v-col class="pa-0 pl-6">
            <v-combobox
              :search-input.sync="year"
              hide-no-data
              :items="years"
              label="Year"
              placeholder="YYYY"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
            >
            </v-combobox>
          </v-col>
          <v-col class="pa-0">
            <v-combobox
              :search-input.sync="month"
              hide-no-data
              :items="months"
              label="Month"
              placeholder="MM"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
            ></v-combobox>
          </v-col>
          <v-col class="pa-0 pr-3">
            <v-combobox
              :search-input.sync="day"
              hide-no-data
              :items="days"
              label="Day"
              placeholder="DD"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
            ></v-combobox>
          </v-col>
        </v-row>
    </fieldset>
  </div>
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
    customProps () {
      return {
        hideDetails: true,
        class: 'customInput',
        flat: true,
        hideNoData: true,
        appendIcon: ''
      }
    },
    customClass () {
      return this.focused ? 'custom-fieldset-focused' : 'custom-fieldset-default'
    },
    years () {
      var year = parseInt(this.year)
      const now = new Date().getUTCFullYear()

      var res = [
        'Unknown'
      ]

      switch (true) {
        case year > 0 && year < 10:
          res = [...res, ...this.getOptions(year, 1000, 'XXX')]
          break
        case year >= 10 && year < 100:
          res = [...res, ...this.getOptions(year, 100, 'XX')]
          break
        case year >= 100 && year < 1000:
          res = [...res, ...this.getOptions(year, 10, 'X')]
          break
        case year >= 1000 && year <= now:
          res = [...res, ...this.getOptions(year, 1, '')]
          break
        default:
          res = [
            ...res,
            ...Array(1000 + ((now + 1) % 1000)).fill('').map((v, idx) => (now - idx).toString())
          ]
          break
      }
      return res
    },
    months () {
      return [
        { text: 'Unknown', value: 'XX' },
        { text: '01 - January', value: '00' },
        { text: '02 - Feb', value: '01' },
        { text: '03 - Mar', value: '02' },
        { text: '04 - Apr', value: '03' },
        { text: '05 - May', value: '04' },
        { text: '06 - Jun', value: '05' },
        { text: '07 - Jul', value: '06' },
        { text: '08 - Aug', value: '07' },
        { text: '09 - Sep', value: '08' },
        { text: '10 - Oct', value: '09' },
        { text: '11 - Nov', value: '10' },
        { text: '12 - Dec', value: '11' }
      ]
    },
    days () {
      return [
        ...Array(32)
          .fill('')
          .map((v, i) => {
              if (i === 0) {
                return {
                  value: 'XX',
                  text: 'Unknown'
                }
              }
              if (i < 10) {
                return {
                  value: ('0' + i).toString(),
                  text: ('0' + i).toString()
                }
              }

              return {
                value: i.toString(),
                text: i.toString()
              }
          })
      ]
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
      on: false,
      day: 'XX',
      month: 'XX',
      year: 'XXXX',
      focused: false
    }
  },
  methods: {
    daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
    },
    getOptions (value, multiplier, edtf) {
      const now = new Date().getUTCFullYear()
      var numb = value * multiplier
      var generatedValues = []
      if (edtf) {
        generatedValues = [
          { text: `${numb}'s`, value: `${value}${edtf}` },
          ...Array((now - numb) + 1)
            .fill('')
            .map((v, idx) => {
              return {
                value: (numb + idx).toString(),
                text: (numb + idx).toString()
              }
            })
        ]
      } else {
        generatedValues = [
          { text: numb.toString(), value: numb.toString() }
        ]
      }

      return [
        ...generatedValues
      ]
    },
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

.rounded-border {
  border: 1px solid #4b4b4b;
  border-radius: 4px;
}

.customInput.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.customInput.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}

.custom-label {
  font-size: 13px;
  margin-left: 8px;
  color: #aaaaaa;
  padding-left: 3px;
  padding-right: 3px;
}

.custom-fieldset-default:hover {
  border-color: white;
}

.custom-fieldset-focused {
  border-width: 2px;
  .custom-label {
    color: #4b4b4b;
  }
  
}
</style>
