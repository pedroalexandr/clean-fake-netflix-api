const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const InternalServerError = require('../helpers/internal-server-error')

// Design pattern: Factory
// Avoid crashing other places that call the object
const makeSUT = () => {
  const authenticationUseCaseSpy = makeAuthenticationUseCase()
  authenticationUseCaseSpy.accessToken = 'valid_token'
  const sut = new LoginRouter(authenticationUseCaseSpy) // SOLI[D]

  return {
    sut,
    authenticationUseCaseSpy
  }
}

const makeAuthenticationUseCase = () => {
  class AuthenticationUseCaseSpy {
    authenticate (email, password) {
      this.email = email
      this.password = password

      return this.accessToken
    }
  }
  return new AuthenticationUseCaseSpy()
}

const makeAuthenticationUseCaseThrowingError = () => {
  class AuthenticationUseCaseSpy {
    authenticate () {
      throw new Error()
    }
  }

  const authenticationUseCaseSpy = new AuthenticationUseCaseSpy()
  const sut = new LoginRouter(authenticationUseCaseSpy)

  return {
    sut,
    authenticationUseCaseSpy
  }
}

describe('Login Router', () => {
  test('Should return 400 if email is not provided', () => {
    const { sut } = makeSUT()
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
    const { sut } = makeSUT()
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
    const { sut } = makeSUT()
    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if httpRequest has no body', () => {
    const { sut } = makeSUT()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should call AuthenticationUseCase with correct parameters', () => {
    const { sut, authenticationUseCaseSpy } = makeSUT()
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

  test('Should return 401 when invalid credentials are provided', () => {
    const { sut, authenticationUseCaseSpy } = makeSUT()
    authenticationUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'foo_invalid_email@email.com',
        password: 'foo_invalid_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 200 if valid credentials are provided', () => {
    const { sut, authenticationUseCaseSpy } = makeSUT()
    const httpRequest = {
      body: {
        email: 'foo_valid_email@email.com',
        password: 'foo_valid_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authenticationUseCaseSpy.accessToken)
  })

  test('Should return 500 if no AuthenticationUseCase is provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if AuthenticationUseCase has no authenticate method', () => {
    const sut = new LoginRouter({})
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if AuthenticationUseCase authenticate method throws an exception', () => {
    const { sut } = makeAuthenticationUseCaseThrowingError()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })
})
