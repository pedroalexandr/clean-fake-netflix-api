const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class AuthenticationUseCase {
  constructor (loadUserByEmailRepository, passwordEncrypter, tokenGenerator) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.passwordEncrypter = passwordEncrypter
    this.tokenGenerator = tokenGenerator
  }

  async authenticate (email, password) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')
    if (!this.loadUserByEmailRepository) throw new MissingParamError('loadUserByEmailRepository')
    if (!this.loadUserByEmailRepository.load) throw new InvalidParamError('loadUserByEmailRepository')
    if (!this.tokenGenerator) throw new MissingParamError('tokenGenerator')
    if (!this.tokenGenerator.generate) throw new InvalidParamError('tokenGenerator')

    const user = await this.loadUserByEmailRepository.load(email)

    if (!user) return null

    const isPasswordCorrect = await this.passwordEncrypter.compare(password, user.password)

    if (!isPasswordCorrect) return null

    this.tokenGenerator.generate(user.id)
  }
}
