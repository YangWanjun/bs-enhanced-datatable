<template>
  <div>
    <at-table-toolbar
      :title="title"
      :tableHead="tableHead"
      :tableData="filteredData"
      :filters="filters"
      :filterLayout="filterLayout"
      :storageKey="storageKey"
      :csv="csv"
      :actions="actions"
      :addProps="addProps"
      @filterChanged="filterChanged"
    />
    <b-table
      hover
      responsive
      class="position-relative"
      :fields="visibleTableHead"
      :items="filteredData"
      :small="small"
      :sticky-header="stickyHeader"
      show-empty
      empty-text="データがありません。"
    >
      <slot v-for="(_, name) in $slots" :name="name" :slot="name" />
      <template
        v-for="(_, name) in $scopedSlots"
        :slot="name"
        slot-scope="slotData"
      >
        <slot :name="name" v-bind="slotData" />
      </template>
      <!-- Column: Actions -->
      <template #cell(actions)="row" v-if="hasRowActions">
        <div class="text-nowrap">
          <template v-for="(act, key) in rowActions">
            <b-button
              v-if="getRowActionvisible(act.visible, row.item)"
              :key="key"
              variant="flat-primary"
              class="btn-icon rounded-circle"
              v-b-tooltip.hover.bottom="act.tooltip"
              @click="act.handleClick(row.item)"
            >
              <feather-icon :icon="act.iconName"/>
            </b-button>
          </template>
          <b-button
            v-if="changeProps.handleOk && changeProps.visible !== false"
            variant="flat-primary"
            class="btn-icon rounded-circle"
            v-b-tooltip.hover.bottom="changeProps.title"
            @click="$refs._dlgChange && $refs._dlgChange.show(row.item)"
          >
            <feather-icon icon="EditIcon"/>
          </b-button>
          <b-button
            v-if="deleteProps.handleOk && deleteProps.visible !== false"
            variant="flat-primary"
            class="btn-icon rounded-circle"
            v-b-tooltip.hover.bottom="deleteProps.title"
            @click="showDeleteConfirm(row.item)"
          >
            <feather-icon icon="Trash2Icon"/>
          </b-button>
        </div>
      </template>
    </b-table>
    <div class="mx-2 mb-2">
      <b-row>
        <b-col
          cols="12"
          sm="6"
          class="d-flex align-items-center justify-content-center justify-content-sm-start"
        >
          <span class="text-muted">Showing {{ dataMeta.from }} to {{ dataMeta.to }} of {{ dataMeta.of }} entries</span>
        </b-col>
        <!-- Pagination -->
        <b-col
          cols="12"
          sm="6"
          class="d-flex align-items-center justify-content-center justify-content-sm-end"
        >
          <b-pagination
            v-model="currentPage"
            :total-rows="filteredCount"
            :per-page="rowsPerPage"
            first-number
            last-number
            class="mb-0 mt-1 mt-sm-0"
            prev-class="prev-item"
            next-class="next-item"
          >
            <template #prev-text>
              <feather-icon
                icon="ChevronLeftIcon"
                size="18"
              />
            </template>
            <template #next-text>
              <feather-icon
                icon="ChevronRightIcon"
                size="18"
              />
            </template>
          </b-pagination>
        </b-col>
      </b-row>
    </div>
    <at-form-dialog
      v-if="changeProps.handleOk && changeProps.visible !== false"
      :title="changeProps.title"
      :size="changeProps.size"
      ref="_dlgChange"
      :schema="changeProps.schema"
      :layout="changeProps.layout"
      :handleOk="handleChange"
      :onBeforeShow="changeProps.onBeforeShow"
      @change="handleFieldChanged"
      @blur="handleFieldChanged"
    />
  </div>
</template>
<script>
import { common, constants, config, table } from "../utils";

export default {
  name: "at-data-table",
  props: {
    title : { type: String, required: false, default: "" },
    tableHead: { type: Array, required: true, default: () => ([]) },
    tableData: { type: Array, required: true, default: () => ([]) },
    filterLayout: { type: Array, required: false, default: () => ([]) },
    initFilter: { type: Object, required: false, default: () => ({}) },
    storageKey: { type: [String, Number], required: false, default: null },
    actions: { type: Array, required: false, default: () => ([]) },
    small: { type: Boolean, required: false, default: false },
    csv: { type: Boolean, required: false, default: false },
    stickyHeader: { type: Boolean, required: false, default: false },
    addProps: { type: Object, required: false, default: () => ({}) },  // { title, schema, handleOk, visible, callback }
    changeProps: { type: Object, required: false, default: () => ({}) },  // { title, schema, handleOk, onChange, visible, callback }
    deleteProps: { type: Object, required: false, default: () => ({}) },  // { title, handleOk, visible, callback }
    rowActions: { type: Array, required: false, default: () => ([]) },
  },
  data() {
    return {
      filters: common.isEmpty(this.initFilter) ? table.getLocalStorageFilter(this.storageKey) : this.initFilter,
      currentPage: 1,
    }
  },
  computed: {
    rowVariantHead() {
      return this.tableHead.filter(i => i.rowVariant);
    },
    visibleTableHead() {
      const columns = this.tableHead.filter(i => i.visible !== false);
      // 項目の表示を調整する
      table.setSchemaFormatter(columns);
      const actionsColumn = { key: "actions", thClass: "text-center", tdClass: "text-center p-0" };
      return columns.concat(this.hasRowActions ? [actionsColumn] : [])
    },
    filteredCount() {
      return this.tableData.length;
    },
    filteredData() {
      if (this.rowVariantHead) {
        this.tableData.map(row => {
          this.rowVariantHead.map(field => {
            if (typeof field.rowVariant === "function") {
              row["_rowVariant"] = field.rowVariant(row[field.key], row);
            } else if (typeof field.rowVariant === "string") {
              row["_rowVariant"] = field.rowVariant;
            }
          })
        })
      }
      // フィルターの値を項目定義と一致するように
      this.tableHead.map(field => {
        if (field.key in this.filters) {
          this.filters[field.key] = common.evalFieldValue(this.filters[field.key], field)
        }
      })
      return table.stableFilter(this.tableData, this.filters);
    },
    rowsPerPage() {
      return 25
    },
    dataMeta() {
      return {
        from: this.rowsPerPage * (this.currentPage - 1) + (this.filteredCount ? 1 : 0),
        to: this.rowsPerPage * (this.currentPage - 1) + this.filteredCount,
        of: this.filteredCount,
      }
    },
    hasRowActions() {
      const hasChange = !common.isEmpty(this.changeProps) && this.changeProps.visible !== false;
      const hasDelete = !common.isEmpty(this.deleteProps) && this.deleteProps.visible !== false;
      return hasChange || hasDelete || this.rowActions.length > 0;
    },
  },
  methods: {
    filterChanged(val) {
      Object.keys(val).map(key => {
        if (val[key] === "" || val[key] === undefined || val[key] === null) {
          delete val[key]
        }
      })
      this.filters = Object.assign({}, val)
    },
    getRowActionvisible(isVisible, row) {
      if (typeof isVisible === 'function') {
        return isVisible(row);
      } else {
        return isVisible !== false;
      }
    },
    handleChange(row) {
      if (this.changeProps.handleOk) {
        return this.changeProps.handleOk(row).then(() => {
          this.$toast.success(constants.SUCCESS.CHANGED);
          this.$refs._dlgChange.hide();
        }).catch(error => {
          if ("detail" in error) {
            this.$toast.error(error.detail)
          } else {
            const fieldKeys = this.addProps.schema.map(i => i.key)
            Object.keys(error).map(key => {
              if (key !== 'status_code' && fieldKeys.indexOf(key) < 0) {
                // 画面に表示している項目以外は個別エラー表示
                this.$toast.error(error[key][0])
              }
            })
          }
          return Promise.reject(error)
        })
      }
      return Promise.resolve();
    },
    handleFieldBlur(val) {
      if (this.changeProps.onBlur) {
        this.changeProps.onBlur(val);
      }
    },
    handleFieldChanged(val) {
      if (this.changeProps.onChange) {
        this.changeProps.onChange(val);
      }
    },
    showDeleteConfirm(row) {
      return this.$bvModal.msgBoxConfirm(common.formatStr(constants.CONFIRM.DELETE_CONFIRM, this.deleteProps.title), {
        title: "削除",
        ...config.dialogOption,
      }).then(isOk => {
        if (isOk && this.deleteProps.handleOk) {
          return this.deleteProps.handleOk(row).catch(error => {
            if ("detail" in error) {
              this.$toast.error(error.detail)
            } else {
              Object.keys(error).map(key => {
                if (key !== 'status_code') {
                  this.$toast.error(error[key][0])
                }
              })
            }
          })
        }
        return Promise.resolve();
      });
    },
  },
}
</script>
