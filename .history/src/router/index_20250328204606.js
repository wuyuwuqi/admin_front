import { createRouter, createWebHistory } from 'vue-router'
import LandlordStorage from '../utils/LandlordStorage'

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
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
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
        path: 'in-progress',
        name: 'OrderInProgress',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'in-progress' }
      },
      {
        path: 'after-sale',
        name: 'OrderAfterSale',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'after-sale' }
      },
      {
        path: 'refunded',
        name: 'OrderRefunded',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'refunded' }
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
  // 检查是否已登录
  const isAuthenticated = LandlordStorage.isAuthenticated()
  console.log('路由守卫检测登录状态:', isAuthenticated, '目标路由:', to.path)
  
  // 如果路由需要认证且用户未登录，则重定向到登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('未登录，重定向到登录页')
    next({ name: 'Login' })
  } else if (to.path === '/login' && isAuthenticated) {
    // 如果已登录但访问登录页，重定向到首页
    console.log('已登录，从登录页重定向到首页')
    next({ path: '/' })
  } else {
    console.log('正常导航到:', to.path)
    next()
  }
})

export default router