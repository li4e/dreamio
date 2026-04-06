import axios from 'axios'
import i18n from 'i18next'
import { getAuthToken } from './lib/auth'

const BASE_URL = 'https://dreamio.ilsur.me/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
})

const NO_AUTH_PATHS = ['/claim', '/health']

apiClient.interceptors.request.use(async (config) => {
  const path = config.url ?? ''
  if (NO_AUTH_PATHS.some((p) => path.startsWith(p))) {
    return config
  }
  const token = await getAuthToken()
  config.headers.Authorization = `Bearer ${token}`
  return config
})

class Api {
  async generatePrompt(signal: AbortSignal): Promise<string> {
    const language = i18n.language
    const res = await apiClient.get('/prompts/random', {
      params: { language },
      signal,
    })
    return res.data.prompt
  }

  reportGeneration(urls: string[], description?: string) {
    return apiClient.post('/claim', {
      urls,
      description,
    })
  }
}

export const api = new Api()
