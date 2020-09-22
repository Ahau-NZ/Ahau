<template>
  <v-row>
    <v-col cols="12" class="pa-1">
      <NodeDatePicker
        :value.sync="start"
        :label="label"
        :readonly="readonly"
        min="0000-01-01"
        :hasError="!!errorMsg"
      />
    </v-col>
    <v-col  v-if="$route.name !== 'login' && allowInterval" cols="12">
      <v-checkbox v-model="showEndDate"
        :label="checkboxLabel" hide-details
        v-bind="customProps"
        outlined
      />
    </v-col>
    <!-- DIED AT PICKER -->
    <v-col cols="12" class="pa-1" v-if="showEndDate">
      <NodeDatePicker
        :label="endLabel"
        :value.sync="end"
        :readonly="readonly"
        min="0000-01-01"
        :hasError="!!errorMsg"
      />
    </v-col>
    <v-col v-if="errorMsg && showEndDate" style="color: red;" class="custom-label">
      {{ errorMsg }}
    </v-col>
  </v-row>
</template>
<script>
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import edtf from 'edtf'
import { mapMutations } from 'vuex'

export default {
  name: 'DateIntervalPicker',
  props: {
    interval: String,
    allowInterval: Boolean,
    hasEndDate: Boolean,
    readonly: Boolean,
    label: {
      type: String,
      required: true
    },
    endLabel: String,
    checkboxLabel: String
  },
  components: {
    NodeDatePicker
  },
  data () {
    return {
      start: '',
      end: '',
      showEndDate: this.hasEndDate,
      errorMsg: null,
      currentDate: new Date().toISOString().slice(0, 10)
    }
  },
  watch: {
    interval: {
      deep: true,
      immediate: true,
      handler (interval) {
        if (!interval) interval = '/'

        if (interval === null || interval === '') interval = '/'
        var [start, end] = interval.split('/')

        this.start = start
        this.end = end
      }
    },
    showEndDate (show) {
      if (!show) this.$emit('update:interval', this.start + '/')
      this.$emit('update:hasEndDate', show)
    },
    start () {
      this.updateInterval()
    },
    end () {
      this.updateInterval()
    },
    errorMsg (val) {
      this.setAllowSubmissions(!val)
    }
  },
  computed: {
    customProps () {
      // readonly = hasSelected || !isEditing
      return {
        readonly: this.readonly,
        flat: this.readonly,
        hideDetails: true,
        placeholder: ' ',
        class: this.readonly ? 'custom mt-0' : 'mt-0',
        light: true
      }
    }
  },
  methods: {
    ...mapMutations(['setAllowSubmissions']),
    updateInterval () {
      var interval = this.start + '/' + this.end

      try {
        if (this.start === '' && this.end !== '') {
          var [year] = this.end.split('-')
          interval = year + '/' + this.end
        } else if (this.start !== this.end) edtf(interval)
        this.$emit('update:interval', interval)
        this.errorMsg = null
      } catch (err) {
        this.errorMsg = 'Please try another date range'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
.custom-label {
  font-size: 12px;
  margin-left: 8px;
  color: var(--custom-label);
  padding-left: 3px;
  padding-right: 3px;
}
</style>
