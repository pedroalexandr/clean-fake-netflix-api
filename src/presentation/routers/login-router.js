const HttpResponse = require('../helpers/http-response')
const MissingParamError = require('../helpers/missing-param-error')

module.exports = class LoginRouter {
  constructor (authenticationUseCase) {
    this.authenticationUseCase = authenticationUseCase
  }

  async route (httpRequest) {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        return HttpResponse.badRequest(new MissingParamError('email'))
      }
      if (!password) {
        return HttpResponse.badRequest(new MissingParamError('password'))
      }

      const accessToken = await this.authenticationUseCase.authenticate(email, password)

      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }

      return HttpResponse.ok({ accessToken })
    } catch (error) {
      return HttpResponse.internalServerError()
    }
  }
}
