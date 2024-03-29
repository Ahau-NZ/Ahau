<template>
  <div>
    <!-- Text || Number field -->
    <v-text-field
      v-if="fieldDef.type === 'text' || fieldDef.type === 'number'"
      v-model="value"
      :type="fieldDef.type"
      :label="fieldDef.label"
      v-bind="customProps"
      :rules="fieldRules"
    />
    <!-- Date field-->
    <NodeDatePicker
      v-else-if="fieldDef.type === 'date'"
      :value.sync="value"
      :label="fieldDef.label"
      :readonly="readonly"
      min="0000-01-01"
    />
    <!-- Checkbox field -->
    <v-checkbox
      v-else-if="fieldDef.type === 'checkbox' && !readonly"
      v-model="value"
      :label="fieldDef.label"
      hide-details
      v-bind="customProps"
      :rules="fieldRules"
    />
    <!-- List of MultipleChoice feild -->
    <v-select
      v-else-if="fieldDef.type === 'list' && !readonly"
      v-model="value"
      :label="fieldDef.label"
      :items="fieldDef.options"
      :menu-props="{ light: true }"
      v-bind="customProps"
      :chips="fieldDef.multiple"
      :deletable-chips="fieldDef.multiple"
      :multiple="fieldDef.multiple"
      :rules="fieldRules"
    />

    <!-- Array field -->
    <v-row v-else-if="fieldDef.type === 'array'">
      <v-col v-for="(_, i) in value" :key="`${fieldDef.key}-${i}`" :class="{ 'pt-0 mt-0': i === 0, 'pt-2': i > 0 }" :cols="smScreen ? 12 : 6">
        <v-text-field
          v-model="value[i]"
          :label="`${fieldDef.label} (${i + 1})`"
          :append-icon="!readonly ? 'mdi-delete' : ''"
          @click:append="removeItem(i)"
          v-bind="customProps"
          :readonly="readonly"
          :rules="fieldRules"
        />
      </v-col>
      <AddButton v-if="!readonly" :align="'flex-end'" :justify="justifyBtn" :width="'50px'" :label="fieldDef.label" @click="addEmptyItem" row/>
    </v-row>
    <v-text-field
      v-else-if="readonly"
      :value="value"
      type="text"
      :label="fieldDef.label"
      v-bind="customProps"
      :rules="fieldRules"
    />
  </div>
</template>

<script>
import AddButton from '@/components/button/AddButton.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'

export default {
  name: 'CustomField',
  props: {
    fieldDef: Object,
    fieldValue: [String, Number, Boolean, Array, Object], // TODO: object? (list)
    readonly: Boolean,
    sideView: Boolean,
    isRegistration: Boolean
  },
  components: {
    AddButton,
    NodeDatePicker
  },
  data () {
    return {
      value: null,
      rules: [value => !!value || 'Required.']
    }
  },
  watch: {
    fieldValue: {
      immediate: true,
      deep: true,
      handler (val) {
        this.value = val
      }
    },
    value: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('update:fieldValue', val)
      }
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
        light: true,
        outlined: !this.readonly
      }
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    smScreen () {
      return this.mobile || this.sideView
    },
    justifyBtn () {
      return this.smScreen ? 'start' : 'center'
    },
    fieldRules () {
      if (!this.isRegistration) return []

      return this.fieldDef.required ? this.rules : []
    }
  },
  methods: {
    addEmptyItem () {
      this.value.push('')
    },
    removeItem (i) {
      this.value.splice(i, 1)
    }
  }
}
</script>
