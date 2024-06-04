import { prepareDB } from './src/__tests__/tools/prepare_db'

beforeAll(async () => {
  await prepareDB()
})

jest.mock('./src/integrations/firebase_auth', () => {
  return jest.requireActual(
    './src/__tests__/__mocks__/integrations/firebase_auth'
  )
})

jest.mock('./src/integrations/openai', () => {
  return jest.requireActual('./src/__tests__/__mocks__/integrations/openai')
})

jest.mock('./src/integrations/storage', () => {
  return jest.requireActual('./src/__tests__/__mocks__/integrations/storage')
})

jest.mock('./src/integrations/adapty', () => {
  return jest.requireActual('./src/__tests__/__mocks__/integrations/adapty')
})
