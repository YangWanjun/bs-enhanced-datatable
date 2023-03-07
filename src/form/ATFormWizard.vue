<template>
  <form-wizard
    ref="wizard"
    color="#7367F0"
    :title="title"
    :subtitle="subtitle"
    layout="vertical"
    class="wizard-vertical mb-3"
    @on-validate="handleValidation"
    @on-complete="handleComplete"
  >
    <tab-content
      v-for="(step, key) in steps"
      :key="key"
      :title="step.title"
      :before-change="() => validateTab(key)"
    >
      <div v-if="step.description" class="mb-1">
        {{ step.description }}
      </div>
      <at-form-layout
        :ref="`step-${key}-form`"
        :inline="step.formProps.inline"
        :schema="step.formProps.schema"
        :newLineSchema="step.formProps.newLineSchema"
        :layout="step.formProps.layout"
        :value="data[step.formProps.name]"
        :errors="errors[step.formProps.name]"
        :allowAdd="step.formProps.allowAdd"
        :allowDelete="step.formProps.allowDelete"
        :inlines="step.formProps.inlines"
        @input="(val) => onInput(step.formProps.name, val)"
        @blur="(val) => onChange(val.key, step.formProps.name, step.formProps.onBlurs, val.inlineName, val.inlineIndex)"
        @change="(val) => onFieldChanged(val, step.formProps.name, step.formProps.onChanges, val.inlineName, val.inlineIndex)"
      />
    </tab-content>
    <template slot="footer" slot-scope="props">
      <div class="wizard-footer-left">
        <b-button
          v-for="(action, key) in getVisibleActions(props.activeTabIndex)"
          :key="key"
          :variant="action.variant || 'primary'"
          v-b-tooltip.hover.bottom="action.tooltip"
          @click="handleActionClick(props.activeTabIndex, action)"
        >
          {{ action.title }}
        </b-button>
      </div>
      <div class="wizard-footer-right">
        <b-button v-if="props.activeTabIndex > 0" @click="props.prevTab()" variant="outline-secondary" class="mr-1">前へ</b-button>
        <b-button v-if="!props.isLastStep" @click="props.nextTab()" class="wizard-footer-right">次へ</b-button>
        <b-button v-else @click="props.nextTab()" class="wizard-footer-right finish-button" variant="primary">{{props.isLastStep ? '確定' : '次へ'}}</b-button>
      </div>
    </template>
  </form-wizard>
</template>
<script>
import { common, constants } from '../utils';
import ATFormLayout from './ATFormLayout.vue'
export default {
  components: { ATFormLayout },
  name: "at-form-wizard",
  props: {
    title: { type: String, required: false, default: null },
    subtitle: { type: String, required: false, default: null },
    steps: { type: Array, required: true, default: () => ([]) },  // [{ title, description, formProps, onBeforeChange }, ...]
    onComplete: { type: Function, required: false },
  },
  data() {
    return {
      data: {},
      errors: {},
    }
  },
  created() {
    this.data = this.getInitData(this.steps)
  },
  watch: {
    steps(value) {
      this.data = this.getInitData(value)
    },
  },
  methods: {
    getInitData(_steps) {
      const _data = {};
      _steps.map(s => {
        // 同じ名称のデータは複数のフォームの分ける可能性があるので、Object.assignを使う。
        const tmpData = (s.formProps && s.formProps.data) ? s.formProps.data : ({})
        if (Array.isArray(tmpData)) {
          _data[s.formProps.name] = tmpData;
        } else {
          _data[s.formProps.name] = Object.assign(_data[s.formProps.name] || {}, tmpData);
        }
      });
      return _data;
    },
    setData(args) {
      if (typeof args === "function") {
        this.data = common.clone(args(this.data));
      } else {
        this.data = common.clone(args);
      }
    },
    onInput(name, val) {
      this.data[name] = val
      this.data = common.clone(this.data);
      this.$emit("input", this.data)
    },
    getVisibleActions(activeIndex) {
      if (this.steps.length === 0) {
        return [];
      }
      const step = this.steps[activeIndex];
      return Array.isArray(step.actions) ? step.actions.filter(i => i.visible !== false) : [];
    },
    toNext(x, y) {
      console.log(x, y)
    },
    validateTab(stepIndex) {
      const self = this;
      const step = this.steps[stepIndex]
      const refName = `step-${stepIndex}-form`;
      const formData = this.data[step.formProps.name]
      return new Promise((resolve, reject) => {  // eslint-disable-line
        return resolve(self.$refs[refName][0].validate())
      }).then(async(isValid) => {
        if (isValid) {
          if (step.onBeforeChange) {
            // onBeforeChangeの中に、true/falseのPromiseを戻してください。
            const val = await step.onBeforeChange(formData, self.data);
            return val;
          } else {
            return true;
          }
        } else {
          return Promise.reject(false);
        }
      })
    },
    handleValidation(isValid, tabIndex) {
      console.log('Tab: '+tabIndex+ ' valid: '+isValid)
    },
    handleComplete() {
      if (this.onComplete) {
        this.onComplete(this.data).then(() => {
          this.$toast.success(constants.SUCCESS.SAVED);
        }).catch(error => {
          // エラーを発生したタブを表示
          const stepsName = this.steps.map(i => i.formProps.name);
          Object.keys(error).map(formName => {
            const stepIndexes = stepsName.map((i, idx) => i === formName ? idx : null).filter(i => i !== null);
            if (stepIndexes.length === 1) {
              this.$refs.wizard.tabs[stepIndexes[0]].validationError = true;
              this.$refs.wizard.changeTab(this.steps.length - 1, stepIndexes[0]);
            } else if (stepIndexes.length > 1) {
              let idxChangeTo = null;
              stepIndexes.map(i => {
                const formKeys = this.steps[i].formProps.schema.map(i => i.key);
                for (let key of Object.keys(error[formName])) {
                  if (formKeys.indexOf(key) >= 0) {
                    this.$refs.wizard.tabs[i].validationError = true;
                    idxChangeTo = idxChangeTo === null || idxChangeTo > i ? i : idxChangeTo
                    return false;
                  }
                }
              });
              // １つ目のエラータブに移動する。
              if (idxChangeTo > -1 && idxChangeTo < this.steps.length - 1) {
                this.$refs.wizard.changeTab(this.steps.length - 1, idxChangeTo);
              }
            }
          })
          this.errors = error;
          if ("detail" in error) {
            this.$toast.error(error.detail);
          }
          common.scrollToError();
        })
      }
    },
    handleActionClick(activeIndex, action) {
      const step = this.steps[activeIndex];
      const formName = step.formProps.name;
      action.handleClick(this.data).then(_data => {
        Object.assign(this.data[formName], _data);
        this.data = common.clone(this.data)
      });
    },
    onFieldChanged(field, formName, methods, inlineName, inlineIndex) {
      const formErrors = this.errors[formName];
      if (formErrors && field.key in formErrors) {
        delete formErrors[field.key]
        this.errors = common.clone(this.errors)
      }
      this.onChange(field.key, formName, methods, inlineName, inlineIndex)
    },
    onChange(fieldName, formName, methods, inlineName, inlineIndex) {
      if (methods) {
        Object.keys(methods).map(name => {
          if (fieldName === name) {
            let funcs = methods[fieldName];
            if (!Array.isArray(funcs)) {
              funcs = [funcs]
            }
            funcs.map(method => {
              method(fieldName, formName, this.data, inlineName, inlineIndex).then(_data => {
                if(_data) {
                  this.data = common.clone(_data);
                }
              });
            })
          }
        })
      }
    },
  }
}
</script>
