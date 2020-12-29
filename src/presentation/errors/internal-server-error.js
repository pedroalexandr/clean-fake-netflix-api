module.exports = class InternalServerError extends Error {
  constructor () {
    super('Internal server error. Try again later.')
    this.name = 'InternalServerError' // convention
  }
}
