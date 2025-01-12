import {
  // DefaultApi,
  // Configuration,
  GetGeneration200Response,
} from '@choco/api-client'
import axios from 'axios'
// import { HOST_DEV } from '../constants'
// import { IS_LOCAL_DEV } from '../constants'
import { CustomAPI } from './customAPI'
import { firebaseAuth } from './firebase'

// let host = `https://dreamio.ilsur.me`
// if (IS_LOCAL_DEV) {
//   host = `http://${HOST_DEV}:5003`
// }

// const baseUrl = `${host}/api/v1`

// const config = new Configuration()
const axiosInstance = axios.create()

axiosInstance.interceptors.request.use(async function (requestConfig) {
  const user = firebaseAuth.currentUser
  if (user) {
    const token = await user.getIdToken()
    requestConfig.headers.set('firebase-token', token)
  }
  return requestConfig
})

// export const api = new DefaultApi(config, baseUrl, axiosInstance)
export const api = new CustomAPI()

export type GenerationDto = GetGeneration200Response['generation']
