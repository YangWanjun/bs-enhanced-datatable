import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import AtEnhancedDatatable from '../../src/index'

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import App from './App'
import router from './router'

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(AtEnhancedDatatable);

new Vue({
  router,
  render: h => h(App),
}).$mount('#root')
