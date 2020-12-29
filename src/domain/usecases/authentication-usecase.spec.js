const { MissingParamError } = require('../../utils/errors')

class AuthenticationUseCase {
  async authenticate (email) {
    if (!email) {
      throw new MissingParamError('email')
    }
  }
}

describe('AuthenticationUseCase', () => {
  test('Should throw an error if no email is provided', async () => {
    const sut = new AuthenticationUseCase()
    const promise = sut.authenticate()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})
