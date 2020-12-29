const { MissingParamError } = require('../../utils/errors')

class AuthenticationUseCase {
  async authenticate (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    } else if (!password) {
      throw new MissingParamError('password')
    }
  }
}

describe('AuthenticationUseCase', () => {
  test('Should throw an error if no email is provided', async () => {
    const sut = new AuthenticationUseCase()
    const promise = sut.authenticate()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
  test('Should throw an error if no password is provided', async () => {
    const sut = new AuthenticationUseCase()
    const promise = sut.authenticate('foo_email@mail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })
})
