jest.mock('./src/services/firebase', () => {
  return jest.requireActual('./src/services/__mocks__/firebase')
})
