const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const InternalServerError = require('../helpers/internal-server-error')
const InvalidParamError = require('../helpers/invalid-param-error')

const makeSUT = () => {
  const authenticationUseCaseSpy = makeAuthenticationUseCase()
  const emailValidator = makeEmailValidator()
  authenticationUseCaseSpy.accessToken = 'valid_token'
  emailValidator.isEmailValid = true
  const sut = new LoginRouter(authenticationUseCaseSpy, emailValidator)

  return {
    sut,
    authenticationUseCaseSpy,
    emailValidator
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      return this.isEmailValid
    }
  }
  return new EmailValidatorSpy()
}

const makeEmailValidatorThrowingError = () => {
  class EmailValidatorSpy {
    isValid () {
      throw new Error()
    }
  }

  return new EmailValidatorSpy()
}

const makeAuthenticationUseCase = () => {
  class AuthenticationUseCaseSpy {
    async authenticate (email, password) {
      this.email = email
      this.password = password

      return this.accessToken
    }
  }
  return new AuthenticationUseCaseSpy()
}

const makeAuthenticationUseCaseThrowingError = () => {
  class AuthenticationUseCaseSpy {
    async authenticate () {
      throw new Error()
    }
  }

  return new AuthenticationUseCaseSpy()
}

describe('Login Router', () => {
  test('Should return 400 if email is not provided', async () => {
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if password is not provided', async () => {
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 400 when invalid email is provided', async () => {
    const { sut, emailValidator } = makeSUT()
    emailValidator.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'foo_invalid_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSUT()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSUT()
    const httpRequest = {}
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should call AuthenticationUseCase with correct parameters', async () => {
    const { sut, authenticationUseCaseSpy } = makeSUT()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    await sut.route(httpRequest)
    expect(authenticationUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authenticationUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', async () => {
    const { sut, authenticationUseCaseSpy } = makeSUT()
    authenticationUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'foo_invalid_email@email.com',
        password: 'foo_invalid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 200 if valid credentials are provided', async () => {
    const { sut, authenticationUseCaseSpy } = makeSUT()
    const httpRequest = {
      body: {
        email: 'foo_valid_email@email.com',
        password: 'foo_valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authenticationUseCaseSpy.accessToken)
  })

  test('Should return 500 if no AuthenticationUseCase is provided', async () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if no EmailValidator is provided', async () => {
    const authenticationUseCase = makeAuthenticationUseCase()
    const sut = new LoginRouter(authenticationUseCase)
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if EmailValidator has no isValid method', async () => {
    const authenticationUseCase = makeAuthenticationUseCase()
    const sut = new LoginRouter(authenticationUseCase, {})
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if EmailValidator isValid method throws an error', async () => {
    const authenticationUseCase = makeAuthenticationUseCase()
    const emailValidator = makeEmailValidatorThrowingError()
    const sut = new LoginRouter(authenticationUseCase, emailValidator)
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if AuthenticationUseCase has no authenticate method', async () => {
    const sut = new LoginRouter({})
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })

  test('Should return 500 if AuthenticationUseCase authenticate method throws an error', async () => {
    const authenticationUseCase = makeAuthenticationUseCaseThrowingError()
    const sut = new LoginRouter(authenticationUseCase)
    const httpRequest = {
      body: {
        email: 'foo_email@email.com',
        password: 'foo_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new InternalServerError())
  })
})
