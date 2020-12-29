const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class AuthenticationUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async authenticate (email, password) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')
    if (!this.loadUserByEmailRepository) throw new MissingParamError('loadUserByEmailRepository')
    if (!this.loadUserByEmailRepository.load) throw new InvalidParamError('loadUserByEmailRepository')

    const user = await this.loadUserByEmailRepository.load(email)

    return user ? null : null
  }
}
