import { Token } from './token.js'
import { TokenType } from './constants/token-type.js'
import { reservedKeywords } from './constants/reserved-keywords.js'

export class Scanner {
  constructor({ source, onError }) {
    // the character currently being considered
    this.current = 0
    // track what source line this.current is on
    this.line = 1
    this.source = source
    // the first character in the lexeme being scanned
    this.start = 0
    this.tokens = []
    this.onError = onError
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(
      new Token({
        type: TokenType.EOF,
        line: this.line
      })
    )

    return this.tokens
  }

  isAtEnd() {
    return this.current >= this.source.length
  }

  scanToken() {
    const character = this.advance()
    switch (character) {
      case '(': {
        this.addToken(TokenType.LEFT_PAREN)
        break
      }
      case ')': {
        this.addToken(TokenType.RIGHT_PAREN)
        break
      }
      case '{': {
        this.addToken(TokenType.LEFT_BRACE)
        break
      }
      case '}': {
        this.addToken(TokenType.RIGHT_BRACE)
        break
      }
      case ',': {
        this.addToken(TokenType.COMMA)
        break
      }
      case '.': {
        this.addToken(TokenType.DOT)
        break
      }
      case '-': {
        this.addToken(TokenType.MINUS)
        break
      }
      case '+': {
        this.addToken(TokenType.PLUS)
        break
      }
      case ';': {
        this.addToken(TokenType.SEMICOLON)
        break
      }
      case '*': {
        this.addToken(TokenType.STAR)
        break
      }
      case '!': {
        if (this.match('=')) {
          this.addToken(TokenType.BANG_EQUAL)
        } else {
          this.addToken(TokenType.BANG)
        }
        break
      }
      case '=': {
        if (this.match('=')) {
          this.addToken(TokenType.EQUAL_EQUAL)
        } else {
          this.addToken(TokenType.EQUAL)
        }
        break
      }
      case '<': {
        if (this.match('=')) {
          this.addToken(TokenType.LESS_EQUAL)
        } else {
          this.addToken(TokenType.LESS)
        }
        break
      }
      case '>': {
        if (this.match('=')) {
          this.addToken(TokenType.GREATER_EQUAL)
        } else {
          this.addToken(TokenType.GREATER)
        }
        break
      }
      case '/': {
        // a comment continues to the end of the line.
        if (this.match('/')) {
          const isNewLine = this.peek() == '\n'
          while (!isNewLine && !this.isAtEnd()) {
            this.advance()
          }
        } else {
          this.addToken(TokenType.SLASH)
        }
        break
      }
      case ' ':
      case '\r':
      case '\t': {
        // Ignore whitespace.
        break
      }
      case '\n':
        this.line++
        break
      case '"':
        this.string()
        break
      default: {
        if (this.isNumber(character)) {
          this.number()
        } else if (this.isAlpha(character)) {
          this.identifier()
        } else {
          this.onError(this.line, 'Unexpected character.')
        }
        break
      }
    }
  }

  advance() {
    this.current++

    return this.source[this.current - 1]
  }

  addToken(tokenType, literal) {
    const text = this.source.substring(this.start, this.current)
    this.tokens.push(
      new Token({
        type: tokenType,
        line: this.line,
        lexeme: text,
        literal
      })
    )
  }

  match(expected) {
    if (this.isAtEnd()) {
      return false
    }
    if (this.source.charAt(this.current) != expected) {
      return false
    }

    // only consume the current character if it’s what we’re looking for.
    this.current++
    return true
  }

  // As it only looks at the current unconsumed character,
  // we have one character of *lookahead*.
  peek() {
    if (this.isAtEnd()) {
      return '\0'
    } else {
      return this.source[this.current]
    }
  }

  string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') {
        this.line++
      }
      this.advance()
    }

    if (this.isAtEnd()) {
      this.onError(this.line, 'Unterminated string')
      return
    }

    // Handle the closing ".
    this.advance()

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1)

    this.addToken(TokenType.STRING, value)
  }

  isAlpha(char) {
    return (
      ('a' <= char && char <= 'z') ||
      ('A' <= char && char <= 'Z') ||
      char === '_'
    )
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance()
    }

    const text = this.source.substring(this.start, this.current)
    const keyword = this.isReservedKeyword(text)
    if (keyword) {
      this.addToken(keyword)
      return
    }

    this.addToken(TokenType.IDENTIFIER)
  }

  isNumber(char) {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(char)
  }

  number() {
    while (this.isNumber(this.peek())) {
      this.advance()
    }

    // Look for a fractional part.
    if (this.peek() == '.' && this.isNumber(this.peekNext())) {
      // Consume the "."
      this.advance()
    }

    while (this.isNumber(this.peek())) {
      this.advance()
    }

    this.addToken(
      TokenType.NUMBER,
      parseFloat(this.source.substring(this.start, this.current))
    )
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) {
      return '\0'
    } else {
      return this.source[this.current + 1]
    }
  }

  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isNumber(char)
  }

  isReservedKeyword(text) {
    return reservedKeywords[text]
  }
}
