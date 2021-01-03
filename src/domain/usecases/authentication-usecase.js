const { MissingParamError } = require('../../utils/errors')

module.exports = class AuthenticationUseCase {
  constructor ({ loadUserByEmailRepository, passwordEncrypter, tokenGenerator }) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.passwordEncrypter = passwordEncrypter
    this.tokenGenerator = tokenGenerator
  }

  async authenticate (email, password) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    const user = await this.loadUserByEmailRepository.load(email)

    if (user) {
      const isPasswordCorrect = await this.passwordEncrypter.compare(password, user.password)

      if (isPasswordCorrect) {
        return this.tokenGenerator.generate(user.id)
      }
    }
    return null
  }
}
