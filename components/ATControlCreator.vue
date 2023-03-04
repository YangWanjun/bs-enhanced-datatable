<template>
  <validation-provider
    ref="provider"
    :key="field.key"
    :name="field.label"
    :vid="field.key"
    :rules="{
      required: field.required === true && field.readonly !== true,
      size: fileSizeLimit ? fileSizeLimit : false,
      date_gte: field.date_gte ? { start: field.date_gte } : false,
      min_value: field.minvalue !== undefined ? field.minvalue : false,
      max_value: field.maxvalue !== undefined ? field.maxvalue : false,
    }"
    v-slot="{ errors, validate }"
  >
    <!-- 読み取り専用 -->
    <b-form-checkbox
      v-if="field.readonly === true && field.type === 'boolean' && field.variant !== 'select'"
      class="mt-2"
      :input-value="value"
      :checked="value"
      :disabled="field.readonly === true"
      style="margin-bottom: 1rem;"
    >{{ field.label }}</b-form-checkbox>
    <b-form-group
      v-else-if="field.readonly === true"
      :label="field.label"
    >
      <b-form-input :readonly="true" :value="readonlyText" />
    </b-form-group>
    <!-- Checkboxの場合 -->
    <template v-else-if="field.type === 'boolean'">
      <b-form-group
        v-if="field.variant === 'select'"
        :label="field.label"
      >
        <b-form-select
          :value="inputValue"
          :options="checkboxOptions"
          @change="onInput"
          :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
        />
        <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
        <small class="text-danger">{{ errors[0] }}</small>
      </b-form-group>
      <b-form-group
        v-else
        :description="field.helptext"
      >
        <b-form-checkbox
          class="mt-2"
          :input-value="value"
          :checked="value"
          @change="onInput"
          :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
        >{{ field.label }}</b-form-checkbox>
        <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
        <small class="text-danger">{{ errors[0] }}</small>
      </b-form-group>
    </template>
    <!-- 選択肢が存在する場合 -->
    <template v-else-if="field.type === 'choice'">
      <b-form-group
        v-if="field.variant === 'autocomplete'"
        :label="field.label"
        :description="field.helptext"
        :label-class="{ 'required': field.required === true }"
      >
        <v-select
          :value="inputValue"
          :options="allowNullOptions"
          :reduce="(option) => option.value"
          label="text"
          :selectable="(option) => option.disabled !== true"
          :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
          @input="onInput"
          :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
        />
        <small class="text-danger">{{ errors[0] }}</small>
      </b-form-group>
      <b-form-group
        v-else-if="isHierarchyOptions"
        :label="field.label"
        :description="field.helptext"
        :label-class="{ 'required': field.required === true }"
      >
        <at-hierarchy-select
          :value="inputValue"
          :options="field.choices"
          :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
          @change="onInput"
        />
        <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
        <small class="text-danger">{{ errors[0] }}</small>
      </b-form-group>
      <b-form-group
        v-else
        :label="field.label"
        :description="field.helptext"
        :label-class="{ 'required': field.required === true }"
      >
        <b-form-select
          :value="inputValue"
          :options="allowNullOptions"
          :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
          @input="onInput"
        />
        <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
        <small class="text-danger">{{ errors[0] }}</small>
      </b-form-group>
    </template>
    <!-- 複数選択できる場合 -->
    <b-form-group
      v-else-if="field.type === 'choices'"
      :label="field.label"
      :description="field.helptext"
      :label-class="{ 'required': field.required === true }"
    >
      <v-select
        :value="inputValue"
        :options="field.choices"
        :reduce="(option) => option.value"
        label="text"
        multiple
        :selectable="(option) => option.disabled !== true"
        :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
        @input="onInput"
      />
      <small class="text-danger">{{ errors[0] }}</small>
    </b-form-group>
    <!-- Textareaの場合 -->
    <b-form-group
      v-else-if="field.type === 'text'"
      :label="field.label"
      :description="field.helptext"
      :label-class="{ 'required': field.required === true }"
    >
      <b-form-textarea
        rows="3"
        max-rows="8"
        :value="inputValue"
        @input="onInput"
        @blur="onBlur"
        :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
        :maxlength="field.maxlength"
      />
      <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
      <small class="text-danger">{{ errors[0] }}</small>
    </b-form-group>
    <!-- 日付の場合 -->
    <b-form-group
      v-else-if="field.type === 'date'"
      :label="field.label"
      :description="field.helptext"
      :label-class="{ 'required': field.required === true }"
    >
      <b-form-datepicker
        label-no-date-selected="選択なし"
        :value="inputValue"
        @input="onInput"
        :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
      />
      <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
      <small class="text-danger">{{ errors[0] }}</small>
    </b-form-group>
    <!-- ファイルの場合 -->
    <b-form-group
      v-else-if="field.type === 'file'"
      :label="field.label"
      :description="field.helptext"
      :label-class="{ 'required': field.required === true }"
    >
      <b-form-file
        browse-text="選択"
        :accept="field.accept"
        :placeholder="value || '選択なし'"
        @change="validate"
        @input="onInputFile"
        :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
      />
      <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
      <small class="text-danger">{{ errors[0] }}</small>
    </b-form-group>
    <!-- 整数・小数の場合 -->
    <b-form-group
      v-else-if="field.type === 'integer' || field.type === 'decimal'"
      :label="field.label"
      :description="field.helptext"
      :label-class="{ 'required': field.required === true }"
    >
      <b-form-input
        :value="inputValue"
        type="number"
        @input="onInput"
        @blur="onBlur"
        :min="field.minvalue"
        :max="field.maxvalue"
        :step="field.step"
        :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
      />
      <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
      <small class="text-danger">{{ errors[0] }}</small>
    </b-form-group>
    <!-- その他の場合 -->
    <b-form-group
      v-else
      :label="field.label"
      :description="field.helptext"
      :label-class="{ 'required': field.required === true }"
    >
      <b-form-input
        :value="inputValue"
        @input="onInput"
        @blur="onBlur"
        :state="(errors.length > 0 || initialErrors.length > 0) ? false:null"
        :maxlength="field.maxlength"
      />
      <small class="text-danger" v-for="(errMsg, key) in initialErrors" :key="key">{{ errMsg }}</small>
      <small class="text-danger">{{ errors[0] }}</small>
    </b-form-group>
  </validation-provider>
</template>
<script>
import { common, constants, config } from '../utils';

export default {
  name: "at-control-creator",
  props: {
    field: { type: Object, required: true, default: () => ({}) },
    value: { type: [String, Number, Boolean, Array], required: false, default: undefined },
    errors: { type: Object, required: false, default: () => ({}) },
  },
  data() {
    return {
      // TODO: propsからdataに値をコピーしないと、vee-validateの一回目のチェックが効かなくなる。
      inputValue: this.value === undefined ? null : this.value,
    }
  },
  created() {
    // if (this.field.key === "is_hourly_pay") {
    //   console.log(this.field.key, this.value)
    // }
  },
  watch: {
    value(val) {
      this.inputValue = val;
    },
  },
  computed: {
    readonlyText() {
      return common.getFieldText(this.value, this.field);
    },
    allowNullOptions() {
      return [{ value: null, text: constants.EMPTY_SELECT_OPTION }].concat(this.field.choices || [])
    },
    checkboxOptions() {
      return [
        { value: null, text: constants.EMPTY_SELECT_OPTION },
        { value: true, text: "はい" },
        { value: false, text: "いいえ" },
      ]
    },
    isHierarchyOptions() {
      if (Array.isArray(this.field.choices) && this.field.choices.length > 0) {
        return Object.prototype.hasOwnProperty.call(this.field.choices[0], "parent")
      }
      return false
    },
    initialErrors() {
      const _errors = this.errors[this.field.key];
      if (Array.isArray(_errors)) {
        return _errors
      } else if (common.isEmpty(_errors)) {
        return []
      } else {
        return [_errors]
      }
    },
    fileSizeLimit() {
      // vee-validateの単位はKBです。
      if (this.field.type === "file") {
        return (this.field.limit ? this.field.limit : config.fileSizeLimit) / 1024;
      }
      return null;
    },
  },
  methods: {
    onInput(val) {
      this.inputValue = common.evalFieldValue(val, this.field);
      this.$emit("input", this.inputValue);
    },
    onBlur(e) {
      this.$emit("blur", e.target.value);
    },
    onInputFile(val) {
      if (val) {
        common.fileToBase64(val).then(result => {
          this.$emit("input", `name:${common.strToBase64(val.name)};${result}`);
        });
      } else {
        this.$emit("input", val || null);
      }
    },
  }
}
</script>
