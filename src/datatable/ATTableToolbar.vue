<template>
  <div>
    <div class="d-flex justify-content-between p-1">
      <div class="d-flex justify-content-start">
        <h5 style="margin-top: 4px">{{ title }}</h5>
        <ul class="list-inline d-inline-block ml-2">
          <li v-for="(tag, key) in filterTags" :key="key" class="list-inline-item">
            <b-form-tag
              :title="`${tag.value}`"
              variant="primary"
              @remove="removeTag(tag.name)"
            >
              {{ tag.text }}
            </b-form-tag>
          </li>
        </ul>
      </div>
      <div>
        <b-button
          v-for="(action, key) in visibleActions"
          :key="key"
          :variant="action.variant || 'flat-primary'"
          class="btn-icon rounded-circle"
          v-b-tooltip.hover.bottom="action.tooltip"
          @click="action.handleClick"
        >
          <at-feather-icon :icon="action.iconName" size="16"/>
        </b-button>
        <b-button
          v-if="addProps.schema && addProps.visible !== false"
          variant="flat-primary"
          class="btn-icon rounded-circle"
          v-b-tooltip.hover.bottom="addProps.title"
          @click="$refs._dlgAdd && $refs._dlgAdd.show()"
        >
          <at-feather-icon icon="PlusIcon" size="16"/>
        </b-button>
        <b-button
          v-if="csv"
          variant="flat-primary"
          class="btn-icon rounded-circle"
          v-b-tooltip.hover.bottom="'CSVをダウンロード'"
          @click="download"
        >
          <at-feather-icon icon="DownloadCloudIcon" size="16"/>
        </b-button>
        <b-button
          v-if="hasFilter"
          variant="flat-primary"
          class="btn-icon rounded-circle"
          v-b-tooltip.hover.bottom="'絞り込み'"
          @click="showFilter = !showFilter"
        >
          <at-feather-icon icon="FilterIcon"/>
        </b-button>
      </div>
    </div>
    <b-collapse v-model="showFilter" class="mt-0">
      <at-form-layout
        :schema="filterTableHead"
        :layout="filterLayout"
        :value="filters"
        :singleLine="true"
        @input="handleFilterChanged"
      />
    </b-collapse>
    <at-form-dialog
      v-if="addProps.schema && addProps.visible !== false"
      ref="_dlgAdd"
      :title="addProps.title"
      :size="addProps.size"
      :schema="addProps.schema"
      :layout="addProps.layout"
      :data="addProps.data"
      :handleOk="handleAdd"
      :onBeforeShow="addProps.onBeforeShow"
      @blur="handleFieldBlur"
      @change="handleFieldChanged"
    />
  </div>
</template>
<script>
import { common, constants, table } from '../utils';

export default {
  name: "at-table-toolbar",
  props: {
    title : { type: String, required: false, default: "" },
    tableHead: { type: Array, required: true, default: () => ([]) },
    tableData: { type: Array, required: true, default: () => ([]) },
    filters: { type: Object, required: false, default: () => ({}) },
    filterLayout: { type: Array, required: false, default: () => ([]) },
    storageKey: { type: [String, Number], required: false, default: null },
    actions: { type: Array, required: false, default: () => ([]) },
    csv: { type: Boolean, required: false, default: false },
    addProps: { type: Object, required: false, default: () => ({}) },  // { title, schema, handleOk, visible, callback }
    filterChanged: { type: Function, required: false },
  },
  data() {
    return {
      showFilter: false,
    }
  },
  computed: {
    filterTableHead() {
      const schema = common.clone(this.tableHead.filter(i => i.searchable === true));
      // visibleはテーブルヘッダー部分の設定なので、フィルターでは全部表示するように
      schema.map(i => i.visible = true);
      return schema;
    },
    hasFilter() {
      return this.filterTableHead.length > 0;
    },
    visibleActions() {
      return this.actions.filter(i => i.visible !== false)
    },
    filterTags() {
      if (common.isEmpty(this.filters)) {
        return null;
      } else {
        const tags = Object.keys(this.filters).map(name => {
          let text = this.filters[name];
          const field = this.tableHead.find(i => i.key === name);
          if (!field) {
            console.error(`フィルター項目"${name}"は存在しません。`);
            return false
          }
          const value = common.evalFieldValue(this.filters[name], field);
          if (field.type === "boolean") {
            if (value) {
              text = field.label;
            } else if (value !== null && value !== undefined) {
              text = `${field.label}ではない`;
            }
          } else if (field.type === "choice") {
            text = common.getDisplayNameFromChoice(value, field.choices)
          }
          return { name, value, text }
        });
        return tags.filter(i => Boolean(i))
      }
    },
  },
  methods: {
    download() {
      table.downloadDataTableCSV(this.title, this.tableHead, this.tableData);
    },
    handleFilterChanged(val) {
      table.saveLocalStorageFilter(this.storageKey, val);
      this.$emit("filterChanged", val)
    },
    removeTag(fieldName) {
      const _filters = Object.assign({}, this.filters);
      delete _filters[fieldName];
      table.saveLocalStorageFilter(this.storageKey, _filters);
      this.$emit("filterChanged", _filters)
    },
    handleFieldBlur(val) {
      if (this.addProps.onBlur) {
        this.addProps.onBlur(val);
      }
    },
    handleFieldChanged(val) {
      if (this.addProps.onChange) {
        this.addProps.onChange(val);
      }
    },
    handleAdd(_data) {
      if (this.addProps.handleOk) {
        return this.addProps.handleOk(_data).then(() => {
          this.$toast.success(constants.SUCCESS.ADDED);
          this.$refs._dlgAdd.hide();
        }).catch(error => {
          if ("detail" in error) {
            this.$toast.error(error.detail);
          } else {
            const fieldKeys = this.addProps.schema.map(i => i.key)
            Object.keys(error).map(key => {
              if (key !== 'status_code' && fieldKeys.indexOf(key) < 0) {
                // 画面に表示している項目以外は個別エラー表示
                this.$toast.error(error[key][0])
              }
            })
          }
          return Promise.reject(error);
        })
      }
      return Promise.resolve();
    },
  }
}
</script>