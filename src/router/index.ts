import { createRouter, createWebHistory } from 'vue-router';
import AllTableView from '../views/AllTableView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'All',
      component: AllTableView
    },
    {
      path: '/paid',
      name: 'paid',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/PaidTableView.vue')
    },
    {
      path: '/unpaid',
      name: 'unpaid',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/UnpaidTableView.vue')
    },
    {
      path: '/overdue',
      name: 'overdue',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/OverdueTableView.vue')
    },
  ]
})

export default router
