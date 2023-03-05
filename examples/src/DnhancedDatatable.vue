<template>
  <div>
    <at-data-table
      title="社員一覧"
      :tableHead="tableHead"
      :tableData="tableData"
      :csv="true"
    />
  </div>
</template>
<script>
import { enhancedDatatable } from './data';

export default {
  data() {
    return {
      tableHead: enhancedDatatable.header,
      tableData: enhancedDatatable.data,
    }
  }
}
</script>
