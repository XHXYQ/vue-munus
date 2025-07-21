import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError
} from 'axios'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_APP_BASE_API,
  baseURL: 'http://120.77.169.224:9088',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code !== 200) {
      console.warn('接口异常：', res.msg)
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res.rows // ✅ 直接返回 rows！
  },
  (error: AxiosError) => {
    console.error('网络错误：', error.message)
    return Promise.reject(error)
  }
)


export default service
