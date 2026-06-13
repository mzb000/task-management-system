import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ---- Auth ----
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login-json', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) =>
    api.post('/auth/reset-password', { token, new_password }),
  changePassword: (current_password, new_password) =>
    api.post('/auth/change-password', { current_password, new_password }),
}

// ---- Tasks ----
export const taskApi = {
  list: (params) => api.get('/tasks', { params }),
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
  comments: (id) => api.get(`/tasks/${id}/comments`),
  addComment: (id, content) => api.post(`/tasks/${id}/comments`, { content }),
}

// ---- Dashboard ----
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
}

// ---- Users ----
export const userApi = {
  list: () => api.get('/users'),
  updateProfile: (data) => api.put('/users/me', data),
  uploadAvatar: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/users/me/avatar', fd)
  },
}

// ---- Notifications & activity ----
export const miscApi = {
  notifications: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  activity: () => api.get('/activity'),
}

// ---- AI Chat ----
export const chatApi = {
  send: (messages) => api.post('/chat', { messages }),
}

export default api
