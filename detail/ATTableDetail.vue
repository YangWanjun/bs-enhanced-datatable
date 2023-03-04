<template>
  <div>
    <b-table-simple class="at-table-detail">
      <b-tr v-for="(field, key) in schema" :key="key">
        <b-th class="text-right">{{ field.label }}</b-th>
        <b-td>
          <div v-if="field.type === 'boolean'">
            <at-boolean-display :data="getFieldValue(field)" />
          </div>
          <div v-else>{{ getFieldValue(field) }}</div>
        </b-td>
      </b-tr>
    </b-table-simple>
    <div v-if="hasActions" class="d-flex justify-content-end mt-1">
      <b-button
        v-if="deleteProps.visible"
        variant="danger"
        @click="showDeleteConfirm"
      >
        削除
      </b-button>
      <b-button
        v-if="changeProps.visible"
        variant="primary ml-1"
        @click="$refs.dlgChangeDetail.show()"
      >
        変更
      </b-button>
    </div>
    <at-form-dialog
      v-if="changeProps.visible"
      :title="`${title}を変更`"
      ref="dlgChangeDetail"
      :size="changeProps.size"
      :schema="changeProps.schema"
      :layout="changeProps.layout"
      :data="Object.assign({}, value)"
      :handleOk="handleChangeDetail"
    />
  </div>
</template>
<script>
import { common, constants, config } from '../utils';
import jwt from '@/auth/jwt/useJwt'
export default {
  name: "at-table-detail",
  props: {
    title: { type: String, required: false },
    schema: { type: Array, required: true, default: () => ([]) },
    value: { type: Object, required: true },
    endpoint: { type: String, required: false },
    changeProps: { type: Object, required: false, default: () => ({}) },  // { schema, layout, visible, method: [put, patch] }
    deleteProps: { type: Object, required: false, default: () => ({}) },  // { visible, callback }
  },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    hasActions() {
      return (this.changeProps && this.changeProps.visible === true) || (this.deleteProps && this.deleteProps.visible === true)
    },
  },
  methods: {
    getFieldValue(field) {
      return common.getFieldText(this.value[field.key], field)
    },
    handleChangeDetail(data) {
      return jwt.request({
        method: this.changeProps.method || "put",
        url: this.endpoint,
        data: data,
      }).then(data => {
        this.$toast.success(this.title ? `${this.title}を変更しました。` : constants.SUCCESS.CHANGED)
        this.$emit("input", data)
        return data;
      })
    },
    showDeleteConfirm() {
      this.$bvModal.msgBoxConfirm(common.formatStr(constants.CONFIRM.DELETE_CONFIRM, this.title), {
        title: "削除",
        ...config.dialogOption,
      }).then(isOk => {
        if (isOk) {
          jwt.delete(this.endpoint).then((data) => {
            if (typeof this.deleteProps.callback === "function") {
              this.deleteProps.callback(data)
            }
          })
        }
      })
    },
  }
}
</script>
