import {
  DefaultApi,
  Configuration,
  GetGeneration200Response,
} from '@choco/api-client'
import axios from 'axios'
import { firebaseAuth } from './firebase'

const baseUrl = 'http://127.0.0.1:5003/api/v1'

const config = new Configuration()
const axiosInstance = axios.create()

axiosInstance.interceptors.request.use(async function (requestConfig) {
  const user = firebaseAuth.currentUser
  if (user) {
    const token = await user.getIdToken()
    requestConfig.headers.set('firebase-token', token)
  }
  return requestConfig
})

export const api = new DefaultApi(config, baseUrl, axiosInstance)

export type GenerationDto = GetGeneration200Response['generation']
