<template>
  <div>
    <fieldset :class="`rounded-border ${customClass}`">
      <legend class="ml-2 custom-label">
        Date of birth
      </legend>
        <v-row>
          <v-col class="pa-0 pl-6">
            <v-autocomplete
              v-model="date.year"
              hide-no-data
              :items="years"
              label="Year"
              placeholder="YYYY"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
            >
            </v-autocomplete>
          </v-col>
          <v-col class="pa-0">
            <v-autocomplete
              v-model="date.month"
              hide-no-data
              :items="months"
              label="Month"
              placeholder="MM"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
            ></v-autocomplete>
          </v-col>
          <v-col class="pa-0 pr-3">
            <v-autocomplete
              v-model="date.day"
              hide-no-data
              :items="days"
              label="Day"
              placeholder="DD"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
            ></v-autocomplete>
          </v-col>
        </v-row>
    </fieldset>
  </div>
</template>
<script>

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
        menuProps: { light: true }
      }
    },
    customClass () {
      return this.focused ? 'custom-fieldset-focused' : 'custom-fieldset-default'
    },
    years () {
      const max = new Date().getUTCFullYear()
      const min = this.minDate.year
      var maxYears = (max - min) + 1
      var years = [
      ]

      Array(maxYears).fill('').forEach((v, i) => {
        var newYear

        var val = (max - i)

        if (val === max) {
          years.push({ value: val.toString(), text: val.toString() })
          return
        }

        switch (true) {
          case val % 1000 === 0:
            newYear = (val / 1000).toString() + 'XXX'
            years.push({ value: newYear, text: newYear })

            break
          case val % 100 === 0:
            newYear = (val / 100).toString() + 'XX'
            years.push({ value: newYear, text: newYear })
            break
          case val % 10 === 0:
            newYear = (val / 10).toString() + 'X'
            years.push({ value: newYear, text: newYear })
            break
          default:
            years.push({ value: val.toString(), text: val.toString() })
            break
        }

        years.push({ value: val.toString(), text: val.toString() })
      })

      if (years.length > 1) years.push({ value: 'XXXX', text: 'XXXX' })

      return years
    },
    months () {
      return [
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
    days () {
      var days = [
        { value: 'XX', text: 'XX' }
      ]
      Array(32)
        .fill('')
        .forEach((v, i) => {
          var indexString = this.intToDDString(i)
          if (i === 0) return

          if (i % 10 !== 0) {
            days.push({ value: indexString, text: indexString })
            return
          }
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
    getOptions (value, multiplier, edtf) {
      const now = new Date().getUTCFullYear()
      var numb = value * multiplier
      var generatedValues = []
      if (edtf) {
        generatedValues = [
          { text: `${numb}'s`, value: `${value}${edtf}` },
          ...Array((now - numb) + 1)
            .fill('')
            .map((v, i) => {
              return {
                value: (numb + i).toString(),
                text: (numb + i).toString()
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
    intToDDString (int) {
      if (int < 10) {
        return ('0' + int).toString()
      }
      return int.toString()
    }
  },
  watch: {
    date: {
      deep: true,
      handler (newValue) {
        var year = this.date.year || 'XXXX'
        var month = this.date.month || 'XX'
        var day = this.date.day || 'XX'

        this.$emit('update:value', `${year}-${month}-${day}`)
      }
    },
    value: {
      deep: true,
      immediate: true,
      handler (value) {
        if (value) {
          if (typeof value === 'object') {
            value = value.edtf
          }
          var date = value.split('-')
          this.date.year = date[0]
          this.date.month = date[1]
          this.date.day = date[2]
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
          if (typeof value === 'object') {
            value = value.edtf
          }
          var date = value.split('-')
          this.minDate.year = parseInt(date[0]) || 1000
          this.minDate.month = parseInt(date[1]) || 1
          this.minDate.day = parseInt(date[2]) || 1
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

.rounded-border {
  border: 1px solid #9e9e9e;
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
