const { MissingParamError } = require('../../utils/errors')

module.exports = class AuthenticationUseCase {
  constructor ({
    loadUserByEmailRepository,
    updateAccessTokenRepository,
    passwordEncrypter,
    tokenGenerator
  } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.updateAccessTokenRepository = updateAccessTokenRepository
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
        const accessToken = this.tokenGenerator.generate(user.id)
        await this.updateAccessTokenRepository.update(user.id, accessToken)
        return accessToken
      }
    }
    return null
  }
}
