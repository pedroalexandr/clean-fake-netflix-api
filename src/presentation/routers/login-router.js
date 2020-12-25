const HttpResponse = require('../helpers/http-response')

module.exports = class LoginRouter {
  constructor (authenticationUseCase) {
    this.authenticationUseCase = authenticationUseCase
  }

  route (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return HttpResponse.internalServerError()
    }

    const { email, password } = httpRequest.body

    if (!email) {
      return HttpResponse.badRequest('email')
    }
    if (!password) {
      return HttpResponse.badRequest('password')
    }

    this.authenticationUseCase.auth(email, password)

    return HttpResponse.unauthorizedError()
  }
}
