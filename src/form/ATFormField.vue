<template>
  <b-col sm="12" :md="colSpan">
    <at-control-creator
      :field="field"
      :value="value[field.key]"
      :errors="errors"
      @input="onInput"
      @blur="onBlur"
    />
  </b-col>
</template>
<script>
import { ATControlCreator } from '../components'
export default {
  components: { ATControlCreator },
  name: "at-form-field",
  props: {
    field: { type: Object, required: true, default: () => ({}) },
    value: { type: Object, required: false, default: () => ({}) },
    colSpan: { type: Number, required: false, default: 1 },
    errors: { type: Object, required: false, default: () => ({}) },
  },
  methods: {
    onInput(val) {
      let value = val;
      if (val === null || val === undefined || val === "") {
        value = null;
      }
      this.value[this.field.key] = value;
      this.$emit("input", this.value);
      this.$emit("change", { key: this.field.key, value: value })
    },
    onBlur(value) {
      this.$emit("blur", { key: this.field.key, value: value });
    }
  },
}
</script>
