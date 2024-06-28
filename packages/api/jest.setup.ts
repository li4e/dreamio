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

jest.mock('./src/config/secrets', () => {
  return jest.requireActual('./src/__tests__/__mocks__/config/secrets')
})

jest.mock('./src/utils/wait', () => {
  return jest.requireActual('./src/__tests__/__mocks__/utils/wait')
})

jest.mock('./src/integrations/pub_sub', () => {
  return jest.requireActual('./src/__tests__/__mocks__/integrations/pub_sub')
})
