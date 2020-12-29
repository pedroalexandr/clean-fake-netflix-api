const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthenticationUseCase = require('./authentication-usecase')

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

const makeSUT = () => {
  const loadUserByEmailRepository = makeLoadUserByEmailRepository()
  const sut = new AuthenticationUseCase(loadUserByEmailRepository)

  return {
    sut,
    loadUserByEmailRepository
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
  test('Should return null if LoadUserByEmailRepository load method returns null', async () => {
    const { sut } = makeSUT()
    const accessToken = await sut.authenticate('foo_notfound_email@mail.com', 'foo_password')
    expect(accessToken).toBeNull()
  })
})
