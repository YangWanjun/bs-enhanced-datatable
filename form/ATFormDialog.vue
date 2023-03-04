<template>
  <b-modal
    :title="title"
    scrollable
    cancel-title="取消"
    ok-title="確定"
    cancel-variant="outline-secondary"
    ref="_dlg"
    :size="size"
    @ok="onOk"
    @hide="onHide"
  >
    <b-overlay :show="loading">
      <at-form-layout
        ref="form"
        :schema="schema"
        :layout="layout"
        :value="copiedData"
        :errors="errors"
        @input="onInput"
        @blur="onBlur"
        @change="onChange"
      />
    </b-overlay>
  </b-modal>
</template>
<script>
import { common } from '../utils'
export default {
  name: "at-form-dialog",
  props: {
    title: { type: String, required: true },
    schema: { type: Array, required: true, default: () => ([]) },
    layout: { type: Array, required: false, default: null },
    data: { type: Object, required: false, default: () => ({}) },
    size: { type: String, required: false, default: null },
    handleOk: { type: Function, required: false },
    onBeforeShow: { type: Function, required: false, },
  },
  data() {
    return {
      loading: false,
      copiedData: {},
      errors: {},
    }
  },
  methods: {
    show(_data) {
      this.$refs['_dlg'].show()
      this.copiedData = this.copyFormData(_data || this.data)
      if (this.onBeforeShow && typeof this.onBeforeShow === "function") {
        this.onBeforeShow(this.copiedData);
      }
    },
    hide() {
      this.$refs['_dlg'].hide()
    },
    onHide() {
      this.errors = {}
    },
    onInput(val) {
      this.copiedData = this.copyFormData(val)
    },
    validate() {
      return this.$refs.form.validate();
    },
    onOk(bvModalEvent) {
      bvModalEvent.preventDefault();
      this.validate().then(valid => {
        if (valid) {
          if (this.handleOk && typeof this.handleOk === "function") {
            this.loading = true;
            this.handleOk(this.copiedData).then(() => {
              // 成功した場合はダイアログを閉じる
              this.hide();
            }).catch(error => {
              if (error.status_code === 400) {
                // サーバー側Validateエラー
                if ("detail" in error) {
                  this.$toast.error(error.detail)
                } else {
                  this.errors = error
                }
              }
            }).finally(() => {
              this.loading = false;
            });
          }
        }
      })
    },
    onBlur({ key, value }) {
      this.$emit("blur", { key, value, data: this.copiedData, callback: (_data) => {
        // フォームのデータを変更したい場合はcallbackを使う。
        if (!common.isEmpty(_data)) {
          this.copiedData = Object.assign(this.copiedData, _data);
          this.copiedData = this.copyFormData(Object.assign(this.copiedData, _data));
        }
      }});
    },
    onChange({ key, value }) {
      if (key in this.errors) {
        const _errors = Object.assign({}, this.errors);
        delete _errors[key];
        this.errors = _errors;
      }
      this.$emit("change", { key, value, data: this.copiedData, callback: (_data) => {
        // フォームのデータを変更したい場合はcallbackを使う。
        if (!common.isEmpty(_data)) {
          this.copiedData = Object.assign(this.copiedData, _data);
          this.copiedData = this.copyFormData(Object.assign(this.copiedData, _data));
        }
      }});
    },
    copyFormData(formData) {
      if (typeof formData === "object") {
        return Object.assign({}, formData);
      } else {
        return formData.slice();
      }
    },
  },
}
</script>
