import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('../views/Order.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'pending-payment',
        name: 'OrderPendingPayment',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'pending-payment' }
      },
      {
        path: 'confirmed',
        name: 'OrderConfirmed',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'confirmed' }
      },
      {
        path: 'checked-in',
        name: 'OrderCheckedIn',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'checked-in' }
      },
      {
        path: 'refunding',
        name: 'OrderRefunding',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'refunding' }
      },
      {
        path: 'reviewed',
        name: 'OrderReviewed',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'reviewed' }
      },
      {
        path: 'completed',
        name: 'OrderCompleted',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'completed' }
      },
      {
        path: 'cancelled',
        name: 'OrderCancelled',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'cancelled' }
      },
      {
        path: 'detail/:id',
        name: 'OrderDetail',
        component: () => import('../views/OrderDetail.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/house',
    name: 'House',
    component: () => import('../views/House.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/coupon',
    name: 'Coupon',
    component: () => import('../views/Coupon.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/role',
    name: 'Role',
    component: () => import('../views/Role.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/log',
    name: 'Log',
    component: () => import('../views/Log.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 模拟检查是否已登录
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  
  // 如果路由需要认证且用户未登录，则重定向到登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router