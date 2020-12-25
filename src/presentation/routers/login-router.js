const HttpResponse = require('../helpers/http-response')

module.exports = class LoginRouter {
  constructor (authenticationUseCase) {
    this.authenticationUseCase = authenticationUseCase
  }

  route (httpRequest) {
    if (!httpRequest ||
        !httpRequest.body ||
        !this.authenticationUseCase ||
        !this.authenticationUseCase.authenticate) {
      return HttpResponse.internalServerError()
    }

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

    return HttpResponse.ok()
  }
}
