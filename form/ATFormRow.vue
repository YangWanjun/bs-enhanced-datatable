<template>
  <b-row>
    <template v-if="typeof row === 'string'">
      <at-form-field
        :key="row"
        :field="getColumn(row)"
        :colSpan="allowDelete ? 11 : 12"
        :value="value"
        :errors="errors"
        @input="onInput"
        @blur="onBlur"
        @change="onChange"
      />
    </template>
    <template v-else-if="Array.isArray(row)">
      <at-form-field
        v-for="fieldName in row"
        :key="getColumn(fieldName).key"
        :field="getColumn(fieldName)"
        :colSpan="getColSpan(fieldName)"
        :value="value"
        :errors="errors"
        @input="onInput"
        @blur="onBlur"
        @change="onChange"
      />
    </template>
    <b-col sm="12" md="1" v-if="allowDelete" class="text-center">
      <b-button
        variant="flat-danger"
        class="btn-icon rounded-circle"
        @click="handleDeleteRow"
      >
        <feather-icon icon="Trash2Icon" />
      </b-button>
    </b-col>
  </b-row>
</template>
<script>
import { common } from '../utils';
import ATFormField from './ATFormField.vue'

export default {
  name: "at-form-row",
  components: { ATFormField },
  props: {
    schema: { type: Array, required: true, default: () => ([]) },
    row: { type: [String, Array, Object], required: true, default: null },
    value: { type: Object, required: false, default: () => ({}) },
    errors: { type: Object, required: false, default: () => ({}) },
    inlineIndex: { type: Number, required: false, default: null },
    allowDelete: { type: Boolean, required: false, default: false },
  },
  methods: {
    getColumn(name) {
      if (common.isJSON(name)) {
        return this.schema.find(i => i.key === Object.keys(name)[0]);
      }
      return this.schema.find(i => i.key === name);
    },
    getColSpan(fieldName) {
      const maxCount = this.allowDelete ? 11 : 12;
      if (common.isJSON(fieldName)) {
        const colspan = fieldName[Object.keys(fieldName)[0]];
        if (this.allowDelete) {
        let sum = 0;
        this.row.map(i => sum += i[Object.keys(i)[0]]);
          if (sum >= 12 && this.row.indexOf(fieldName) == this.row.length - 1) {
            return colspan - 1;
          }
        }
        return colspan
      }
      return Math.floor(maxCount / this.row.length);
    },
    onInput(val) {
      this.$emit("input", val);
    },
    onChange(val) {
      this.$emit("change", val)
    },
    onBlur(value) {
      this.$emit("blur", value);
    },
    handleDeleteRow() {
      this.$emit("delete", this.inlineIndex);
    },
  },
}
</script>
