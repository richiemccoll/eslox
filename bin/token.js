class Token {
  constructor({ type, lexeme = '', literal, line }) {
    this.type = type
    this.lexeme = lexeme
    this.literal = literal
    this.line = line
  }

  toString() {
    return `type=${this.type} lexeme=${
      this.lexeme ? this.lexeme : 'empty'
    } literal=${this.literal}`
  }
}

export { Token }
