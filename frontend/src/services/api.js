import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = 'http://localhost:5000/api'

const getToken = () => Cookies.get('token')

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
})

// Cameras API
export const cameraAPI = {
  getAll: () => axios.get(`${API_URL}/cameras`, { headers: getHeaders() }),
  getById: (id) => axios.get(`${API_URL}/cameras/${id}`, { headers: getHeaders() }),
  create: (data) => axios.post(`${API_URL}/cameras`, data, { headers: getHeaders() }),
  update: (id, data) => axios.put(`${API_URL}/cameras/${id}`, data, { headers: getHeaders() }),
  delete: (id) => axios.delete(`${API_URL}/cameras/${id}`, { headers: getHeaders() }),
  updateStatus: (id, status) => axios.patch(`${API_URL}/cameras/${id}/status`, { status }, { headers: getHeaders() })
}

// Recordings API
export const recordingAPI = {
  getAll: (limit = 50, skip = 0) => axios.get(`${API_URL}/recordings?limit=${limit}&skip=${skip}`, { headers: getHeaders() }),
  getByCamera: (cameraId, startDate, endDate) => 
    axios.get(`${API_URL}/recordings/camera/${cameraId}?startDate=${startDate}&endDate=${endDate}`, { headers: getHeaders() }),
  create: (data) => axios.post(`${API_URL}/recordings`, data, { headers: getHeaders() }),
  archive: (id) => axios.patch(`${API_URL}/recordings/${id}/archive`, {}, { headers: getHeaders() }),
  delete: (id) => axios.delete(`${API_URL}/recordings/${id}`, { headers: getHeaders() })
}

// Analytics API
export const analyticsAPI = {
  getByCamera: (cameraId) => axios.get(`${API_URL}/analytics/camera/${cameraId}`, { headers: getHeaders() }),
  getUnacknowledged: () => axios.get(`${API_URL}/analytics/alerts/unacknowledged`, { headers: getHeaders() }),
  create: (data) => axios.post(`${API_URL}/analytics`, data, { headers: getHeaders() }),
  acknowledge: (id) => axios.patch(`${API_URL}/analytics/${id}/acknowledge`, {}, { headers: getHeaders() }),
  getDashboard: () => axios.get(`${API_URL}/analytics/summary/dashboard`, { headers: getHeaders() })
}

// Users API
export const userAPI = {
  getAll: () => axios.get(`${API_URL}/users`, { headers: getHeaders() }),
  getById: (id) => axios.get(`${API_URL}/users/${id}`, { headers: getHeaders() }),
  update: (id, data) => axios.put(`${API_URL}/users/${id}`, data, { headers: getHeaders() }),
  changeRole: (id, role) => axios.patch(`${API_URL}/users/${id}/role`, { role }, { headers: getHeaders() }),
  deactivate: (id) => axios.patch(`${API_URL}/users/${id}/deactivate`, {}, { headers: getHeaders() }),
  activate: (id) => axios.patch(`${API_URL}/users/${id}/activate`, {}, { headers: getHeaders() })
}
