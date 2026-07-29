import axios from 'axios'
import { getToken } from '../utils/authStorage'

export const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})