import { TokenType } from './constants/token-type'
import { Binary, Grouping, Literal, Unary } from './constants/ast-node-types'

export class Parser {
  constructor() {
    this.current = 0
    this.tokens = []
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
