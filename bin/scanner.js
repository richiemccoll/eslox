import { Token } from './token.js'
import { TokenType } from './constants/token-type.js'

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
          while (this.peek() != '\n' && !this.isAtEnd()) {
            this.advance()
          }
        } else {
          this.addToken(TokenType.SLASH)
        }
        break
      }
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break

      case '\n':
        this.line++
        break
      default: {
        this.onError(this.line, 'Unexpected character.')
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
}
