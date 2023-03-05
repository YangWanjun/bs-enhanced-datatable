import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: '/bs-enhanced-datatable',
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./Home.vue'),
    },
    {
      path: '/enhanced-datatable',
      name: 'enhanced-datatable',
      component: () => import('./DnhancedDatatable.vue'),
    },
  ]
});

export default router
