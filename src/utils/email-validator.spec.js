const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

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
})
