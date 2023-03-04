<template>
  <b-container>
    <validation-observer ref="observer">
      <b-form>
        <b-list-group class="mb-2" v-if="errors.non_field_errors">
          <template v-if="Array.isArray(errors.non_field_errors)">
            <b-list-group-item v-for="(errMsg, key) in errors.non_field_errors" :key="key" variant="danger">
              {{ errMsg }}
            </b-list-group-item>
          </template>
          <b-list-group-item v-else variant="danger">
            {{ errors.non_field_errors }}
          </b-list-group-item>
        </b-list-group>
        <template v-if="inline">
          <at-form-layout
            v-for="(rowValue, key) in value"
            :key="rowValue.__index__"
            :schema="(rowValue.__isNew__ === true && newLineSchema) ? newLineSchema : schema"
            :layout="layout"
            :value="rowValue"
            :inline="false"
            :singleLine="true"
            class="border-bottom mb-1"
            :inlineName="inlineName"
            :inlineIndex="key"
            :allowDelete="allowDelete"
            @blur="onBlur"
            @change="onChange"
            @delete="onDelete"
          />
          <div v-if="allowAdd !== false">
            <b-button variant="outline-primary w-100 mb-1" @click="handleAddRow">
              <feather-icon icon="PlusIcon" />
              追加
            </b-button>
          </div>
        </template>
        <template v-else-if="hasLayout">
          <at-form-row
            v-for="(row, key) in layout"
            :key="key"
            :schema="visibleSchema"
            :row="row"
            :value="value"
            :errors="errors"
            :inlineName="inlineName"
            :inlineIndex="inlineIndex"
            :allowDelete="allowDelete"
            @delete="onDelete"
            @input="onInput"
            @blur="onBlur"
            @change="onChange"
          />
        </template>
        <template v-else>
          <b-row class="match-height">
            <at-form-field
              v-for="(field, key) in visibleSchema"
              :key="field.key"
              :field="field"
              :colSpan="colspanArray[key]"
              :value="value"
              :errors="errors"
              @input="onInput"
              @blur="onBlur"
              @change="onChange"
            />
            <b-col sm="12" md="1" v-if="allowDelete">
              <b-button
                variant="flat-danger"
                class="btn-icon rounded-circle"
                @click="onDelete(inlineIndex)"
              >
                <feather-icon icon="Trash2Icon" />
              </b-button>
            </b-col>
          </b-row>
        </template>
        <template v-if="inlines">
          <div v-for="inlineProps in inlines" :key="inlineProps.name" class="mt-1 inline-form">
            <h3>{{ inlineProps.title }}</h3>
            <at-form-layout
              :schema="inlineProps.schema"
              :newLineSchema="inlineProps.newLineSchema"
              :layout="inlineProps.layout"
              :inline="true"
              :inlineName="inlineProps.name"
              :value="value[inlineProps.name] || []"
              :allowAdd="inlineProps.allowAdd"
              :allowDelete="inlineProps.allowDelete"
              @blur="onBlur"
              @change="onChange"
            />
          </div>
        </template>
      </b-form>
    </validation-observer>
  </b-container>
</template>
<script>
import { common, table } from '../utils'
import ATFormField from './ATFormField.vue'
import ATFormRow from './ATFormRow.vue'

export default {
  name: "at-form-layout",
  components: { ATFormField, ATFormRow },
  props: {
    schema: { type: Array, required: true, default: () => ([]) },
    newLineSchema: { type: Array, required: false, default: null },
    layout: { type: Array, required: false, default: null },
    inline: { type: Boolean, required: false, default: false },
    value: { type: [Object, Array], required: false, default: () => ({}) },
    singleLine: { type: Boolean, required: false, default: false },
    errors: { type: Object, required: false, default: () => ({}) },
    inlineName: { type: String, required: false, default: null },  // リストデータの名前(jsonのkey), inlineIndex=nullの場合は複数行を持つフォーム
    inlineIndex: { type: Number, required: false, default: null },  // リストの「inlineIndex」行目のフォーム、リストの中に更にリストを持つのはサポートしていません。
    allowAdd: { type: Boolean, required: false, default: false },
    allowDelete: { type: Boolean, required: false, default: false },
    inlines: { type: Array, required: false, default: () => ([]) },
  },
  data() {
    return {
      inlineKey: this.inline === true ? this.value.length : 0,
    }
  },
  computed: {
    hasLayout() {
      return !common.isEmpty(this.layout);
    },
    visibleSchema() {
      return this.schema.filter(i => i.visible !== false);
    },
    colspanArray() {
      return table.getColspanArray(this.visibleSchema, this.singleLine, this.allowDelete);
    },
    isRootLayout() {
      return this.inlineName === null || this.inlineName === undefined;
    },
  },
  created() {
    // 値がない場合、既定値を設定
    this.schema.filter(i => i.default !== undefined).map(field => {
      if (this.value[field.key] === undefined) {
        this.value[field.key] = field.default;
      }
    });
    if (this.inline === true) {
      this.value.map((i, idx) => i["__index__"] = idx);
    }
  },
  methods: {
    onInput(val) {
      this.$emit("input", val);
    },
    onBlur(val) {
      val = this.wrapValue(val);
      this.$emit("blur", val);
    },
    onChange(val) {
      val = this.wrapValue(val);
      this.$emit("change", val);
    },
    onDelete(index) {
      if (this.inlineIndex !== null && this.inlineIndex >= 0) {
        this.$emit("delete", index);
      } else {
        this.value.splice(index, 1);
        this.onInput(this.value);
      }
    },
    wrapValue(val) {
      if (this.inlineName) {
        Object.assign(val, { "inlineName": this.inlineName })
      }
      if (this.inlineIndex !== undefined && this.inlineIndex !== null) {
        Object.assign(val, { "inlineIndex": this.inlineIndex })
      }
      return val;
    },
    validate() {
      return this.$refs.observer.validate().then(isValid => {
        if (!isValid) {
          common.scrollToError();
        }
        return isValid;
      })
    },
    handleAddRow() {
      // 空白の１行を追加する。
      this.inlineKey = this.inlineKey + 1;
      this.value.push({ "__isNew__": true, "__index__": this.inlineKey });
      this.onInput(this.value);
    },
  }
}
</script>
<style lang="scss" scoped>
.inline-form {
  h3 {
    border-bottom: 3px solid #4c4c4c;
    padding-bottom: 5px;
  }
  div.container {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
