const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')

// Design pattern: Factory
// Avoid crashing other places that call the object
const buildSUT = () => {
  class AuthenticationUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
    }
  }
  const authenticationUseCaseSpy = new AuthenticationUseCaseSpy()

  // SOLID principle: (D)
  const sut = new LoginRouter(authenticationUseCaseSpy)

  return {
    sut,
    authenticationUseCaseSpy
  }
}

describe('Login Router', () => {
  test('Should return 400 if email is not provided', () => {
    const { sut } = buildSUT()
    const httpRequest = {
      body: {
        password: 'foo_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if password is not provided', () => {
    const { sut } = buildSUT()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if no httpRequest is provided', () => {
    const { sut } = buildSUT()
    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if httpRequest has no body', () => {
    const { sut } = buildSUT()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should call AuthenticationUseCaseSpy with correct parameters', () => {
    const { sut, authenticationUseCaseSpy } = buildSUT()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    sut.route(httpRequest)
    expect(authenticationUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authenticationUseCaseSpy.password).toBe(httpRequest.body.password)
  })
})
