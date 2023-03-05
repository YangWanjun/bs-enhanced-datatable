<template>
  <div>
    <at-table-toolbar
      :title="title"
      :tableHead="tableHead"
      :tableData="sortedRows"
      :actions="actions"
    />
    <b-table-simple hover responsive>
      <b-thead>
        <b-tr>
          <b-th v-for="(col, key) in tableHead" :key="key">{{ col.label }}</b-th>
        </b-tr>
      </b-thead>
      <tbody>
        <b-tr v-for="(row, key1) in sortedRows" :key="key1">
          <b-td v-for="(col, key2) in visibleColumns" :key="key2">
            <b-link v-if="col.to" :to="col.to(row)" :class="getIndentClass(row, key2)">{{ row[col.key] }}</b-link>
            <span v-else :class="getIndentClass(row, key2)">{{ row[col.key] }}</span>
          </b-td>
        </b-tr>
      </tbody>
    </b-table-simple>
  </div>
</template>
<script>
export default {
  name: "at-hierarchy-table",
  props: {
    title : { type: String, required: false, default: "" },
    tableHead: { type: Array, required: true, default: () => ([]) },
    tableData: { type: Array, required: true, default: () => ([]) },
    parentField: { type: String, required: false, default: "parent" },
    pk : { type: [String, Number], required: false, default: "id" },
    actions: { type: Array, required: false, default: () => ([]) },
  },
  computed: {
    visibleColumns() {
      return this.tableHead.filter(i => i.visible !== false);
    },
    sortedRows() {
      const rows = [];
      const rootRows = this.tableData.filter(i => this.isRoot(i))
      const indent = 0;
      rootRows.map(row => {
        this.addRow(row, rows, indent)
      })
      return rows
    },
  },
  methods: {
    childRows(row) {
      return this.tableData.filter(i => i[this.parentField] === row[this.pk])
    },
    isRoot(row) {
      return row[this.parentField] === null || row[this.parentField] === undefined
    },
    addRow(row, outRows, indent) {
      const idx = outRows.findIndex(i => i[this.pk] === row[this.pk])
      row["__indent__"] = indent
      idx >= 0 ? outRows.splice(idx, 0, row) : outRows.push(row)
      this.childRows(row).map(i => {
        this.addRow(i, outRows, indent + 1)
      })
    },
    getIndentClass(row, colIndex) {
      return (colIndex === 0 && row["__indent__"]) ? `ml-${row["__indent__"]}` : "" 
    }
  },
}
</script>
