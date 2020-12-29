const { MissingParamError } = require('../../utils/errors')

class AuthenticationUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async authenticate (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    } else if (!password) {
      throw new MissingParamError('password')
    }

    await this.loadUserByEmailRepository.load(email)
  }
}

class LoadUserByEmailRepository {
  async load (email, password) {
    this.email = email
    this.password = password
    return this.email
  }
}

const makeSUT = () => {
  const loadUserByEmailRepository = new LoadUserByEmailRepository()
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
})
