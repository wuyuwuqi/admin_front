/**
 * LandlordStorage 类
 * 用于管理民宿管理系统的本地存储，包括用户信息、token和登录时间等
 */
export default class LandlordStorage {
  // 存储键名常量
  static KEYS = {
    IS_AUTHENTICATED: 'isAuthenticated',
    USER_INFO: 'userInfo',
    TOKEN: 'token',
    LOGIN_TIME: 'loginTime',
    AUTH_EXPIRY: 'authExpiry',
    ROLE: 'role'
  }

  /**
   * 保存登录响应数据
   * @param {Object} data - 登录响应数据
   * @param {Object} data.landlord - 房东信息
   * @param {string} data.token - 认证令牌
   * @param {string} data.code - 响应代码
   * @param {boolean} remember - 是否记住登录状态
   */
  static saveLoginData(data, remember = false) {
    if (!data || !data.landlord || !data.token) {
      console.error('登录数据格式不正确', data)
      return
    }

    // 保存认证状态
    localStorage.setItem(this.KEYS.IS_AUTHENTICATED, 'true')
    
    // 保存用户信息
    localStorage.setItem(this.KEYS.USER_INFO, JSON.stringify(data.landlord))
    
    // 保存token
    localStorage.setItem(this.KEYS.TOKEN, data.token)
    
    // 保存登录时间
    const loginTime = new Date().toISOString()
    localStorage.setItem(this.KEYS.LOGIN_TIME, loginTime)
    
    // 保存角色信息
    if (data.landlord.role) {
      localStorage.setItem(this.KEYS.ROLE, data.landlord.role)
    }
    
    // 如果选择了记住登录，设置7天的过期时间
    if (remember) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)
      localStorage.setItem(this.KEYS.AUTH_EXPIRY, expiryDate.toString())
    }
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息对象，如果不存在则返回null
   */
  static getUserInfo() {
    const userInfoStr = localStorage.getItem(this.KEYS.USER_INFO)
    if (!userInfoStr) return null
    
    try {
      return JSON.parse(userInfoStr)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  }

  /**
   * 获取认证令牌
   * @returns {string|null} 认证令牌，如果不存在则返回null
   */
  static getToken() {
    return localStorage.getItem(this.KEYS.TOKEN)
  }

  /**
   * 获取登录时间
   * @returns {Date|null} 登录时间，如果不存在则返回null
   */
  static getLoginTime() {
    const loginTimeStr = localStorage.getItem(this.KEYS.LOGIN_TIME)
    return loginTimeStr ? new Date(loginTimeStr) : null
  }

  /**
   * 检查用户是否已认证
   * @returns {boolean} 是否已认证
   */
  static isAuthenticated() {
    return localStorage.getItem(this.KEYS.IS_AUTHENTICATED) === 'true'
  }

  /**
   * 获取用户角色
   * @returns {string|null} 用户角色，如果不存在则返回null
   */
  static getRole() {
    return localStorage.getItem(this.KEYS.ROLE)
  }

  /**
   * 清除所有登录数据
   */
  static clearLoginData() {
    localStorage.removeItem(this.KEYS.IS_AUTHENTICATED)
    localStorage.removeItem(this.KEYS.USER_INFO)
    localStorage.removeItem(this.KEYS.TOKEN)
    localStorage.removeItem(this.KEYS.LOGIN_TIME)
    localStorage.removeItem(this.KEYS.AUTH_EXPIRY)
    localStorage.removeItem(this.KEYS.ROLE)
  }
}