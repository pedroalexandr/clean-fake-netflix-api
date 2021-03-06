const EmailValidator = require('../utils/email-validator')
const validator = require('validator')

const makeSUT = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('Should return true if validator returns true', () => {
    const sut = makeSUT()
    const isEmailValid = sut.isValid('foo_valid_email@email.com')

    expect(isEmailValid).toBe(true)
  })
  test('Should return false if validator returns false', () => {
    const sut = makeSUT()
    validator.isEmailValid = false
    const isEmailValid = sut.isValid('foo_invalid_email@mail.com')

    expect(isEmailValid).toBe(false)
  })
  test('Should call EmailValidator with correct email', () => {
    const sut = makeSUT()
    const email = 'foo_invalid_email@mail.com'
    sut.isValid(email)
    expect(validator.email).toBe(email)
  })
})
