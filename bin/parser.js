import { TokenType } from './constants/token-type'
import {
  Binary,
  Grouping,
  Literal,
  PrintStmt,
  Stmt,
  Unary,
  Var,
  VarStmt
} from './ast-node-types'
import { ParseError } from './errors'

export class Parser {
  constructor({ tokens, onError }) {
    this.current = 0
    this.onError = onError
    this.tokens = tokens
  }

  parse() {
    try {
      const statements = []
      while (!this._isAtEnd()) {
        statements.push(this._declaration())
      }
      return statements
    } catch (error) {
      console.error(`parse() error`, error)
      return null
    }
  }

  _buildBinaryExpression(method, ...matchedTokenTypes) {
    let exp = this[method]()

    while (this._match(matchedTokenTypes)) {
      const operator = this._previous()
      const right = this[method]()
      exp = new Binary({ left: exp, operator, right })
    }

    return exp
  }

  _declaration() {
    try {
      if (this._match(TokenType.VAR)) {
        return this._varDeclaration()
      }

      return this._statement()
    } catch (error) {
      console.error(`parse() error`, error)
      return null
    }
  }

  _statement() {
    if (this._match(TokenType.PRINT)) {
      return this._print()
    }

    const exp = this._expression()
    this._consume(TokenType.SEMICOLON, 'Expect ; after expression')
    return new Stmt(exp)
  }

  _print() {
    const value = this._expression()
    this._consume(TokenType.SEMICOLON, 'Expect ; after value')
    return new PrintStmt(value)
  }

  _varDeclaration() {
    const name = this._consume(
      TokenType.IDENTIFIER,
      'Expect variable name after var'
    )
    let initializer = null
    if (this._match(TokenType.EQUAL)) {
      initializer = this._expression()
    }
    this._consume(TokenType.SEMICOLON, 'Expect ; after expression')
    return new VarStmt(name, initializer)
  }

  _expression() {
    return this._equality()
  }

  _equality() {
    return this._buildBinaryExpression(
      '_comparison',
      TokenType.BANG_EQUAL,
      TokenType.EQUAL_EQUAL
    )
  }

  _comparison() {
    return this._buildBinaryExpression(
      '_term',
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS,
      TokenType.LESS_EQUAL
    )
  }

  _term() {
    return this._buildBinaryExpression(
      '_factor',
      TokenType.MINUS,
      TokenType.PLUS
    )
  }

  _factor() {
    return this._buildBinaryExpression(
      '_unary',
      TokenType.SLASH,
      TokenType.STAR
    )
  }

  _unary() {
    if (this._match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this._previous()
      const right = this._unary()
      return new Unary({ operator, right })
    }

    return this._primary()
  }

  _primary() {
    if (this._match(TokenType.FALSE)) {
      return new Literal(false)
    }
    if (this._match(TokenType.TRUE)) {
      return new Literal(true)
    }
    if (this._match(TokenType.NIL)) {
      return new Literal(null)
    }
    if (this._match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this._previous().literal)
    }
    if (this._match(TokenType.IDENTIFIER)) {
      return new Var(this._previous())
    }
    if (this._match(TokenType.LEFT_PAREN)) {
      const exp = this._expression()
      return new Grouping(exp)
    }
    throw this._error(this._peek(), 'Expect expression')
  }

  _consume(tokenType, message) {
    if (this._check(tokenType)) {
      return this._advance()
    }

    throw this._error(this._peek(), message)
  }

  _error(token, message) {
    if (token.type === TokenType.EOF) {
      this.onError(token.line, ` at end ${message}`)
    } else {
      this.onError(token.line, ` at '${token.lexeme}' ${message}`)
    }
    return new ParseError(token, message)
  }

  _synchronize() {
    this._advance()

    while (!this._isAtEnd()) {
      if (this._previous().type === TokenType.SEMICOLON) {
        return
      }
      switch (this._peek().type) {
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

      this._advance()
    }
  }

  _match(...tokenTypes) {
    let listOfTokenTypes =
      Array.isArray(tokenTypes) && Array.isArray(tokenTypes[0])
        ? tokenTypes[0]
        : tokenTypes

    for (let type of listOfTokenTypes) {
      if (this._check(type)) {
        this._advance()
        return true
      }
    }
    return false
  }

  _check(tokenType) {
    if (this._isAtEnd()) {
      return false
    }
    if (this._peek().type === tokenType) {
      return true
    }
  }
  _advance() {
    if (!this._isAtEnd()) {
      this.current++
    }
    return this._previous()
  }

  _isAtEnd() {
    return this._peek().type === TokenType.EOF
  }

  _peek() {
    return this.tokens[this.current]
  }

  _previous() {
    return this.tokens[this.current - 1]
  }
}
