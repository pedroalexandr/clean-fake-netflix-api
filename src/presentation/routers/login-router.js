const HttpResponse = require('../helpers/http-response')

module.exports = class LoginRouter {
  constructor (authenticationUseCase) {
    this.authenticationUseCase = authenticationUseCase
  }

  route (httpRequest) {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        return HttpResponse.badRequest('email')
      }
      if (!password) {
        return HttpResponse.badRequest('password')
      }

      const accessToken = this.authenticationUseCase.authenticate(email, password)

      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }

      return HttpResponse.ok({ accessToken })
    } catch (error) {
      return HttpResponse.internalServerError()
    }
  }
}
