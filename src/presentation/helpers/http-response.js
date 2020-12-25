const UnauthorizedError = require('../helpers/unauthorized-error')
const InternalServerError = require('./internal-server-error')

module.exports = class HttpResponse {
  static badRequest (error) {
    return {
      statusCode: 400,
      body: error
    }
  }

  static unauthorizedError () {
    return {
      statusCode: 401,
      body: new UnauthorizedError()
    }
  }

  static internalServerError () {
    return {
      statusCode: 500,
      body: new InternalServerError()
    }
  }

  static ok (data) {
    return {
      statusCode: 200,
      body: data
    }
  }
}
