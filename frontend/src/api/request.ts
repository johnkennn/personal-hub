import axios from 'axios'
import { getToken } from '../utils/authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const request = axios.create({
  baseURL,
  timeout: 5000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})