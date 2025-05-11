import { createRouter, createWebHistory } from 'vue-router'
import LandlordStorage from '../utils/LandlordStorage'
import MyComments from '../views/MyComments.vue'

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
        path: 'checked-in',
        name: 'OrderCheckedIn',
        component: () => import('../views/Order.vue'),
        meta: { requiresAuth: true, orderStatus: 'checked-in' }
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
      // 订单详情已整合到Order.vue中，不再需要单独的路由
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
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'ChatDefault',
        component: () => import('../views/chat/ChatMessage.vue')
      },
      {
        path: ':id(\\d+)',  // 只匹配数字ID
        name: 'ChatMessage',
        component: () => import('../views/chat/ChatMessage.vue'),
        props: true
      }
    ]
  },
  {
    path: '/my-comments',
    name: 'MyComments',
    component: MyComments
  },
  // 添加通配符路由，处理所有未匹配的路径
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: (to) => {
      console.log('未找到路由，重定向到首页:', to)
      return '/'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  router.push('/')
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