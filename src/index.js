import { ATControlCreator, ATFeatherIcon } from './components';
import { ATDataTable, ATHierarchyTable, ATTableToolbar } from './datatable';
import {
  ATFormDialog,
  ATFormField,
  ATFormLayout,
  ATFormRow,
  ATFormWizard,
} from './form';

import { email, min_value, max_value, required, size } from "vee-validate/dist/rules";
import lang from "vee-validate/dist/locale/ja.json";
import { extend, localize } from 'vee-validate';
import { ValidationProvider, ValidationObserver } from 'vee-validate';

import VueFormWizard from 'vue-form-wizard'
import 'vue-form-wizard/dist/vue-form-wizard.min.css';

extend('email', email);
extend('min_value', min_value);
extend('max_value', max_value);
extend('required', required);
extend('size', size);
extend('date_gte', {
  params: ['start'],
  validate(value, { start }) {
    if (value && start) {
      return new Date(value) >= new Date(start);
    }
    return true;
  },
  message: "{_field_}は{start}以降の日付に選択してください。",
})
localize("ja", lang);

const EnhancedDatatable = {
  install(Vue) {
    Vue.use(VueFormWizard)
    Vue.component('validation-provider', ValidationProvider);
    Vue.component('validation-observer', ValidationObserver);
    Vue.component(ATControlCreator.name, ATControlCreator);
    Vue.component(ATFeatherIcon.name, ATFeatherIcon);
    Vue.component(ATDataTable.name, ATDataTable);
    Vue.component(ATHierarchyTable.name, ATHierarchyTable);
    Vue.component(ATTableToolbar.name, ATTableToolbar);
    Vue.component(ATFormDialog.name, ATFormDialog);
    Vue.component(ATFormField.name, ATFormField);
    Vue.component(ATFormLayout.name, ATFormLayout);
    Vue.component(ATFormRow.name, ATFormRow);
    Vue.component(ATFormWizard.name, ATFormWizard);
  }
};

export default EnhancedDatatable;
