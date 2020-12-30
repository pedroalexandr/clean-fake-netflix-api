const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthenticationUseCase = require('./authentication-usecase')

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

const makePasswordEncrypter = () => {
  class PasswordEncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  return new PasswordEncrypterSpy()
}

const makeSUT = () => {
  const loadUserByEmailRepository = makeLoadUserByEmailRepository()
  loadUserByEmailRepository.user = {
    password: 'hashed_password'
  }
  const passwordEncrypter = makePasswordEncrypter()
  passwordEncrypter.isValid = true
  const sut = new AuthenticationUseCase(loadUserByEmailRepository, passwordEncrypter)

  return {
    sut,
    loadUserByEmailRepository,
    passwordEncrypter
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
    const sut = new AuthenticationUseCase()
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
  })

  test('Should throw an error if LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthenticationUseCase({})
    const promise = sut.authenticate('foo_email@mail.com', 'foo_password')
    expect(promise).rejects.toThrow(new InvalidParamError('loadUserByEmailRepository'))
  })

  test('Should return null if an incorrect email is provided', async () => {
    const { sut, loadUserByEmailRepository } = makeSUT()
    loadUserByEmailRepository.user = null
    const accessToken = await sut.authenticate('foo_incorrect_email@mail.com', 'foo_password')
    expect(accessToken).toBeNull()
  })

  test('Should return null if an incorrect password is provided', async () => {
    const { sut, passwordEncrypter } = makeSUT()
    passwordEncrypter.isValid = false
    const accessToken = await sut.authenticate('foo_email@mail.com', 'foo_incorrect_password')
    expect(accessToken).toBeNull()
  })

  test('Should call PasswordEncrypter with correct values', async () => {
    const { sut, loadUserByEmailRepository, passwordEncrypter } = makeSUT()
    await sut.authenticate('foo_valid_email@mail.com', 'foo_password')
    expect(passwordEncrypter.password).toBe('foo_password')
    expect(passwordEncrypter.hashedPassword).toBe(loadUserByEmailRepository.user.password)
  })
})
