<template>
  <div>
    <fieldset :class="`rounded-border ${customClass}`">
      <legend class="ml-2 custom-label">
        Date of birth
      </legend>
        <v-row>
          <v-col class="pa-0 pl-6">
            <v-combobox
              :search-input.sync="date.year"
              hide-no-data
              :items="years"
              label="Year"
              placeholder="YYYY"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
              :value="date.year"
            >
            </v-combobox>
          </v-col>
          <v-col class="pa-0">
            <v-combobox
              :search-input.sync="date.month"
              hide-no-data
              :items="months"
              label="Month"
              placeholder="MM"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
              :value="date.month"
            ></v-combobox>
          </v-col>
          <v-col class="pa-0 pr-3">
            <v-combobox
              :search-input.sync="date.day"
              hide-no-data
              :items="days"
              label="Day"
              placeholder="DD"
              v-bind="customProps"
              @focus="focused = true"
              @blur="focused = false"
              :value="date.day"
            ></v-combobox>
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
    value: { type: String, default: 'XXXX-XX-XX' },
    readonly: { type: Boolean, default: false }
  },
  data () {
    return {
      focused: false,
      date: {
        year: '',
        month: '',
        day: ''
      }
    }
  },
  mounted () {
    var valueToEdtf = edtf(this.value)
    this.date.year = valueToEdtf.getUTCFullYear().toString()
    this.date.month = this.months[valueToEdtf.getUTCMonth() + 1].text
    this.date.day = this.days[valueToEdtf.getUTCDate()].text
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
      var year = parseInt(this.date.year)
      const now = new Date().getUTCFullYear()

      var res = [
        'Unknown'
      ]

      switch (true) {
        case year > 0 && year < 10:
          return [...res, ...this.getOptions(year, 1000, 'XXX')]
        case year >= 10 && year < 100:
          return [...res, ...this.getOptions(year, 100, 'XX')]
        case year >= 100 && year < 1000:
          return [...res, ...this.getOptions(year, 10, 'X')]
        case year >= 1000 && year <= now:
          return [...res, ...this.getOptions(year, 1, '')]
        default:
          return [
            ...res,
            ...Array(1000 + ((now + 1) % 1000)).fill('').map((v, i) => (now - i).toString())
          ]
      }
    },
    months () {
      return [
        { text: 'Unknown', value: 'XX' },
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
            var val = this.intToDDString(i)
            return {
              text: val,
              value: val
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
        this.$emit('update:value', this.date.year, this.date.month, this.date.day)
      }
    },
    value (newValue) {
      console.log(newValue)
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
