import { TokenType } from './constants/token-type'
import { Binary, Grouping, Literal, Unary } from './constants/ast-node-types'

class ParseError extends Error {
  constructor(token, message) {
    super(`${token} ${message}`)
  }
}

export class Parser {
  constructor({ onError }) {
    this.current = 0
    this.onError = onError
    this.tokens = []
  }

  parse() {
    try {
      this.expression()
    } catch (error) {
      console.error(`parse() error`, error)
      return null
    }
  }

  _buildBinaryExpression(method, ...matchedTokenTypes) {
    let exp = this[method]()

    while (this.match(matchedTokenTypes)) {
      const operator = this.previous()
      const right = this[method]()
      exp = new Binary({ left: exp, operator, right })
    }

    return exp
  }

  expression() {
    return this.equality()
  }

  equality() {
    return this._buildBinaryExpression(
      'comparison',
      TokenType.BANG_EQUAL,
      TokenType.EQUAL_EQUAL
    )
  }

  comparison() {
    return this._buildBinaryExpression(
      'term',
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS,
      TokenType.LESS_EQUAL
    )
  }

  term() {
    return this._buildBinaryExpression(
      'factor',
      TokenType.MINUS,
      TokenType.PLUS
    )
  }

  factor() {
    return this._buildBinaryExpression('unary', TokenType.SLASH, TokenType.STAR)
  }

  unary() {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new Unary({ operator, right })
    }

    return this.primary()
  }

  primary() {
    if (this.match(TokenType.FALSE)) {
      return new Literal(false)
    }
    if (this.match(TokenType.TRUE)) {
      return new Literal(true)
    }
    if (this.match(TokenType.NIL)) {
      return new Literal(null)
    }
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal)
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const exp = this.expression()
      return new Grouping(exp)
    }
    throw this.error(this.peek(), 'Expect expression')
  }

  consume(tokenType, message) {
    if (this.check(tokenType)) {
      return this.advance()
    }

    throw this.error(this.peek(), message)
  }

  error(token, message) {
    if (token.type === TokenType.EOF) {
      this.onError(token.line, ` at end ${message}`)
    } else {
      this.onError(token.line, ` at '${token.lexeme}' ${message}`)
    }
    return new ParseError(token, message)
  }

  synchronize() {
    this.advance()

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) {
        return
      }
      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return
      }

      this.advance()
    }
  }

  match(...tokenTypes) {
    for (let type of tokenTypes) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  check(tokenType) {
    if (this.isAtEnd()) {
      return false
    }
    if (this.peek().type === tokenType) {
      return true
    }
  }
  advance() {
    if (!this.isAtEnd()) {
      this.current++
    }
    return this.previous()
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF
  }

  peek() {
    return this.tokens[this.current]
  }

  previous() {
    return this.tokens[this.current - 1]
  }
}
