export class ParseError extends Error {
  constructor(token, message) {
    super(`${token} ${message}`)
  }
}

export class RuntimeError {
  constructor(message) {
    this.message = message
  }
}

export class ReturnError {
  constructor(val) {
    this.value = val
  }
}
