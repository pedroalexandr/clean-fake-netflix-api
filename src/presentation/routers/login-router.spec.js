class LoginRouter {
  route (httpRequest) {
    const { email, password } = httpRequest.body

    if (!email || !password) {
      return {
        statusCode: 400
      }
    }
  }
}

describe('Login Router', () => {
  test('Should return 400 if email is not provided', () => {
    // sut = system under test
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        password: 'foo_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if password is not provided', () => {
    // sut = system under test
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'foo_email@email.com'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})
