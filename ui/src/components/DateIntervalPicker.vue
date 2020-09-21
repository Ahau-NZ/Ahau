<template>
  <v-row>
    <v-col cols="12" class="pa-1">
      <NodeDatePicker
        :value.sync="start"
        :label="label"
        :readonly="readonly"
        min="0000-01-01"
      />
    </v-col>
    <v-col  v-if="$route.name !== 'login' && allowInterval" cols="12" class="pa-1">
      <v-checkbox v-model="showEndDate"
        label="No longer living" :hide-details="true"
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
        :min="start || '-3000-01-01'"
      />
    </v-col>
    <v-col v-if="errorMsg" style="color: red;">
      {{ errorMsg }}
    </v-col>
  </v-row>
</template>
<script>
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import edtf from 'edtf'

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
    endLabel: String
  },
  components: {
    NodeDatePicker
  },
  data () {
    return {
      start: null,
      end: null,
      showEndDate: this.hasEndDate,
      errorMsg: null
    }
  },
  watch: {
    interval: {
      deep: true,
      immediate: true,
      handler (interval) {
        var [start, end] = interval.split('/')

        this.start = start
        this.end = end
      }
    },
    showEndDate (show) {
      this.$emit('update:hasEndDate', show)
    },
    start () {
      this.updateInterval()
    },
    end () {
      this.updateInterval()
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
        class: this.readonly ? 'custom' : '',
        light: true
      }
    }
  },
  methods: {
    updateInterval () {
      var interval = this.start + '/' + this.end

      try {
        if (this.start !== this.end) edtf(interval)
        this.$emit('update:interval', interval)
        this.errorMsg = null
      } catch (err) {
        console.log('err', err)
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
</style>
