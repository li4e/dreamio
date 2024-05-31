jest.mock('./src/integrations/firebase_auth', () => {
  return jest.requireActual('./src/integrations/__mocks__/firebase_auth')
})

jest.mock('./src/integrations/openai', () => {
  return jest.requireActual('./src/integrations/__mocks__/openai')
})

jest.mock('./src/integrations/storage', () => {
  return jest.requireActual('./src/integrations/__mocks__/storage')
})

jest.mock('./src/integrations/adapty', () => {
  return jest.requireActual('./src/integrations/__mocks__/adapty')
})
