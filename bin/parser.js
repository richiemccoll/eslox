import { TokenType } from './constants/token-type.js'
import {
  Assignment,
  Binary,
  Block,
  Call,
  Func,
  Grouping,
  IfStmt,
  Literal,
  Logical,
  PrintStmt,
  Return,
  Stmt,
  Unary,
  Var,
  VarStmt,
  WhileStmt
} from './ast-node-types.js'
import { ParseError } from './errors.js'

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
      if (this._match(TokenType.FUN)) {
        return this._func()
      }
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
    if (this._match(TokenType.FOR)) {
      return this._forLoop()
    }

    if (this._match(TokenType.IF)) {
      return this._ifStatement()
    }

    if (this._match(TokenType.PRINT)) {
      return this._print()
    }

    if (this._match(TokenType.RETURN)) {
      return this._return()
    }

    if (this._match(TokenType.WHILE)) {
      return this._whileStatement()
    }

    if (this._match(TokenType.LEFT_BRACE)) {
      return new Block(this._block())
    }

    const exp = this._expression()
    this._consume(TokenType.SEMICOLON, 'Expect ; after expression')
    return new Stmt(exp)
  }

  _block() {
    const statements = []

    while (!this._check(TokenType.RIGHT_BRACE) && !this._isAtEnd()) {
      statements.push(this._declaration())
    }

    this._consume(TokenType.RIGHT_BRACE, 'Expect } after block')

    return statements
  }

  _print() {
    const value = this._expression()
    this._consume(TokenType.SEMICOLON, 'Expect ; after value')
    return new PrintStmt(value)
  }

  _return() {
    const keyword = this._previous()
    let value = null
    if (!this._check(TokenType.SEMICOLON)) {
      value = this._expression()
    }
    this._consume(TokenType.SEMICOLON, 'Expected ; after return statement')
    return new Return(keyword, value)
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

  _ifStatement() {
    this._consume(TokenType.LEFT_PAREN, 'Expect ( after if statement')
    const condition = this._expression()
    this._consume(TokenType.RIGHT_PAREN, 'Expect ) after condition')

    const thenBranch = this._statement()
    let elseBranch = null

    if (this._match(TokenType.ELSE)) {
      elseBranch = this._statement()
    }

    return new IfStmt(condition, thenBranch, elseBranch)
  }

  _whileStatement() {
    this._consume(TokenType.LEFT_PAREN, 'Expect ( after while statement')
    const condition = this._expression()
    this._consume(TokenType.RIGHT_PAREN, 'Expect ) after while condition')

    const body = this._statement()
    return new WhileStmt(condition, body)
  }

  _forLoop() {
    this._consume(TokenType.LEFT_PAREN, 'Expect ( after for "for"')

    let initializer

    if (this._match(TokenType.SEMICOLON)) {
      initializer = null
    } else if (this._match(TokenType.VAR)) {
      initializer = this._varDeclaration()
    } else {
      initializer = this._expression()
    }

    let condition = null
    if (!this._check(TokenType.SEMICOLON)) {
      condition = this._expression()
    }
    this._consume(TokenType.SEMICOLON, 'Expect ; after loop condition')

    let increment = null
    if (!this._check(TokenType.RIGHT_PAREN)) {
      increment = this._expression()
    }
    this._consume(TokenType.RIGHT_PAREN, 'Expect ) after "for" clauses')

    let body = this._statement()

    if (increment) {
      body = new Block([body, new Stmt(increment)])
    }

    if (!condition) {
      condition = new Literal(true)
    }

    body = new WhileStmt(condition, body)

    if (initializer) {
      body = new Block([initializer, body])
    }

    return body
  }

  _func(kind = 'function') {
    const name = this._consume(TokenType.IDENTIFIER, `Expect ${kind} name`)
    this._consume(TokenType.LEFT_PAREN, `Expect ( after ${kind}`)

    const args = []
    if (!this._check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          // Don't throw - allow the parser to keep parsing
          this._error(this._peek(), 'Cannot have more than 255 arguments.')
        }
        args.push(this._expression())
      } while (this._match(TokenType.COMMA))
    }

    this._consume(TokenType.RIGHT_PAREN, 'Expect ) after arguments')
    this._consume(TokenType.LEFT_BRACE, `Expect { after ${kind}`)
    const body = this._block()

    return new Func(name, args, body)
  }

  _expression() {
    return this._assignment()
  }

  _assignment() {
    const exp = this._or()

    if (this._match(TokenType.EQUAL)) {
      const equals = this._previous()
      const value = this._assignment()
      if (exp instanceof Var) {
        const name = exp.name
        return new Assignment(name, value)
      }
      throw ParseError(equals, 'Invalid assignment')
    }

    return exp
  }

  _or() {
    let exp = this._and()

    while (this._match(TokenType.OR)) {
      const operator = this._previous()
      const right = this._and()
      exp = new Logical(exp, operator, right)
    }

    return exp
  }

  _and() {
    let exp = this._equality()

    while (this._match(TokenType.AND)) {
      const operator = this._previous()
      const right = this._equality()
      exp = new Logical(exp, operator, right)
    }

    return exp
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

    return this._call()
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

      this._consume(TokenType.RIGHT_PAREN, `Expect ')' after expression.`)

      return new Grouping(exp)
    }
    throw this._error(this._peek(), 'Expect expression')
  }

  _call() {
    let exp = this._primary()

    while (true) {
      if (this._match(TokenType.LEFT_PAREN)) {
        exp = this._finishCall(exp)
      } else {
        break
      }
    }

    return exp
  }

  _finishCall(exp) {
    const args = []
    if (!this._check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          // Don't throw - allow the parser to keep parsing
          this._error(this._peek(), 'Cannot have more than 255 arguments.')
        }
        args.push(this._expression())
      } while (this._match(TokenType.COMMA))
    }
    const paren = this._consume(
      TokenType.RIGHT_PAREN,
      'Expect ) after arguments'
    )
    return new Call(exp, paren, args)
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
