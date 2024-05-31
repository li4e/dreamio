jest.mock('./src/services/firebase', () => {
  return jest.requireActual('./src/services/__mocks__/firebase')
})

jest.mock('./src/services/openai', () => {
  return jest.requireActual('./src/services/__mocks__/openai')
})
