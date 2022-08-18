<template>
  <div>
    <!-- Text || Number field -->
    <v-text-field
      v-if="field.type === 'text' || field.type === 'number'"
      v-model="value"
      :type="field.type"
      :label="field.label"
      v-bind="customProps"
      :rules="field.required ? rules : []"
    />
    <!-- Date field-->
    <DateIntervalPicker
      v-if="field.type === 'date'"
      :label="field.label"
      allowInterval
      :interval.sync="value"
      :rules="field.required ? rules : []"
    />
    <!-- Checkbox field -->
    <v-checkbox
      v-else-if="field.type === 'checkbox'"
      v-model="value"
      :label="field.label"
      hide-details
      v-bind="customProps"
      :rules="field.required ? rules : []"
    />
    <!-- List of MultipleChoice feild -->
    <v-select
      v-else-if="field.type === 'list'"
      v-model="value"
      :label="field.label"
      :items="field.options"
      :menu-props="{ light: true }"
      v-bind="customProps"
      :chips="field.multiple"
      :deletable-chips="field.multiple"
      :multiple="field.multiple"
      :rules="field.required ? rules : []"
    />
    <!-- Array field -->
    <v-row v-else-if="field.type === 'array'">
      <v-col v-for="(_, i) in value" :key="`${field.key}-${i}`" :class="{ 'pt-0 mt-0': i === 0, 'pt-2': i > 0 }" cols="6">
        <v-text-field
          v-model="value[i]"
          :label="`${field.label} (${i + 1})`"
          :append-icon="!readonly ? 'mdi-delete' : ''"
          @click:append="removeItem(i)"
          v-bind="customProps"
          :readonly="readonly"
          :rules="field.required ? rules : []"
        />
      </v-col>
      <AddButton v-if="!readonly" :align="'flex-end'" :justify="justifyBtn" :width="'50px'" :label="field.label" @click="addEmptyItem" row/>
    </v-row>
    <!-- <v-col v-else class="py-1">{{ field.label }}</v-col> -->
  </div>
</template>

<script>
import AddButton from '@/components/button/AddButton.vue'

export default {
  name: 'CustomField',
  props: {
    field: Object,
    fieldValue: [String, Number, Boolean, Array, Object], // TODO: object? (list)
    readonly: Boolean,
    sideView: Boolean
  },
  components: {
    AddButton
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
