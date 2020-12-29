class AuthenticationUseCase {
  async authenticate (email) {
    if (!email) {
      throw new Error()
    }
  }
}

describe('AuthenticationUseCase', () => {
  test('Should throw an error if no email is provided', async () => {
    const sut = new AuthenticationUseCase()
    const promise = sut.authenticate()
    expect(promise).rejects.toThrow()
  })
})
