const { MissingParamError } = require('../../utils/errors')
const AuthenticationUseCase = require('./authentication-usecase')

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepository = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepository.user = {
    id: 'foo_id',
    password: 'hashed_password'
  }
  return loadUserByEmailRepository
}

const makePasswordEncrypter = () => {
  class PasswordEncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isPasswordCorrect
    }
  }
  const passwordEncrypter = new PasswordEncrypterSpy()
  passwordEncrypter.isPasswordCorrect = true
  return passwordEncrypter
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGenerator = new TokenGeneratorSpy()
  tokenGenerator.accessToken = 'valid_access_token'
  return tokenGenerator
}

const makeSUT = () => {
  const loadUserByEmailRepository = makeLoadUserByEmailRepository()
  const passwordEncrypter = makePasswordEncrypter()
  const tokenGenerator = makeTokenGenerator()
  const sut = new AuthenticationUseCase(loadUserByEmailRepository, passwordEncrypter, tokenGenerator)

  return {
    sut,
    loadUserByEmailRepository,
    passwordEncrypter,
    tokenGenerator
  }
}

describe('AuthenticationUseCase', () => {
  test('Should throw an error if no email is provided', async () => {
    const { sut } = makeSUT()
    const promise = sut.authenticate()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw an error if no password is provided', async () => {
    const { sut } = makeSUT()
    const promise = sut.authenticate('foo_email@mail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepository } = makeSUT()
    await sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(loadUserByEmailRepository.email).toBe('foo_email@mail.com')
  })

  test('Should throw an error if no LoadUserByEmailRepository is provided', async () => {
    const passwordEncrypter = makePasswordEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const sut = new AuthenticationUseCase(null, passwordEncrypter, tokenGenerator)
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow()
  })

  test('Should throw an error if LoadUserByEmailRepository has no load method', async () => {
    const passwordEncrypter = makePasswordEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const sut = new AuthenticationUseCase({}, passwordEncrypter, tokenGenerator)
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow()
  })

  test('Should return null if an incorrect email is provided', async () => {
    const { sut, loadUserByEmailRepository } = makeSUT()
    loadUserByEmailRepository.user = null
    const accessToken = await sut.authenticate('foo_incorrect_email@mail.com', 'foo_password')
    expect(accessToken).toBeNull()
  })

  test('Should return null if an incorrect password is provided', async () => {
    const { sut, passwordEncrypter } = makeSUT()
    passwordEncrypter.isPasswordCorrect = false
    const accessToken = await sut.authenticate('foo_email@mail.com', 'foo_incorrect_password')
    expect(accessToken).toBeNull()
  })

  test('Should throw an error if no PasswordEncrypter is provided', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const tokenGenerator = makeTokenGenerator()
    const sut = new AuthenticationUseCase(loadUserByEmailRepository, null, tokenGenerator)
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow()
  })

  test('Should throw an error if PasswordEncrypter has no compare method', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const tokenGenerator = makeTokenGenerator()
    const sut = new AuthenticationUseCase(loadUserByEmailRepository, {}, tokenGenerator)
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow()
  })

  test('Should throw an error if no TokenGenerator is provided', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const passwordEncrypter = makePasswordEncrypter()
    const sut = new AuthenticationUseCase(loadUserByEmailRepository, passwordEncrypter, null)
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow()
  })

  test('Should throw an error if TokenGenerator has no generate method', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const passwordEncrypter = makePasswordEncrypter()
    const sut = new AuthenticationUseCase(loadUserByEmailRepository, passwordEncrypter, {})
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow()
  })

  test('Should call PasswordEncrypter with correct values', async () => {
    const { sut, loadUserByEmailRepository, passwordEncrypter } = makeSUT()
    await sut.authenticate('foo_valid_email@mail.com', 'foo_password')
    expect(passwordEncrypter.password).toBe('foo_password')
    expect(passwordEncrypter.hashedPassword).toBe(loadUserByEmailRepository.user.password)
  })

  test('Should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepository, tokenGenerator } = makeSUT()
    await sut.authenticate('foo_valid_email@mail.com', 'foo_password')
    expect(tokenGenerator.userId).toBe(loadUserByEmailRepository.user.id)
  })

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGenerator } = makeSUT()
    const accessToken = await sut.authenticate('foo_correct_email@mail.com', 'foo_correct_password')
    expect(accessToken).toBe(tokenGenerator.accessToken)
    expect(accessToken).toBeTruthy()
  })
})
