import { Binary, Literal, Unary } from './constants/ast-node-types'
import { TokenType } from './constants/token-type'

export class Interpreter {
  // A literal is a bit of syntax that produces a value.
  // convert the literal tree node from the parser into a runtime value.
  _visitLiteral(exp) {
    return exp.accept(this)
  }

  _visitGrouping(exp) {
    // TODO - implement accept
    return this._evaluate(exp.expression)
  }

  _visitUnary(exp) {
    const right = this._evaluate(exp.right)

    switch (exp.operator.type) {
      case TokenType.MINUS: {
        return -right
      }
      case TokenType.BANG: {
        return !this._isTruthy(right)
      }
    }
    // Unreachable.
    return null
  }

  _visitBinary(exp) {
    const left = this._evaluate(exp.left)
    const right = this._evaluate(exp.right)

    switch (exp.operator.type) {
      case TokenType.MINUS: {
        return left - right
      }
      case TokenType.SLASH: {
        return left / right
      }
      case TokenType.STAR: {
        return left * right
      }
      case TokenType.PLUS: {
        // since we're in JS land...
        // the + operator is overloaded to support both adding numbers
        // and concatenating strings
        return left + right
      }
      case TokenType.GREATER: {
        return left > right
      }
      case TokenType.GREATER_EQUAL: {
        return left >= right
      }
      case TokenType.LESS: {
        return left < right
      }
      case TokenType.LESS_EQUAL: {
        return left <= right
      }
      case TokenType.EQUAL_EQUAL: {
        // a conscious choice to opt out of JS implicit coercion
        return left == right
      }
      case TokenType.BANG_EQUAL: {
        // a conscious choice to opt out of JS implicit coercion
        return left != right
      }
    }
    // unreachable
    return null
  }

  _evaluate(exp) {
    if (exp instanceof Literal) {
      return this._visitLiteral(exp)
    }
    if (exp instanceof Unary) {
      return this._visitUnary(exp)
    }
    if (exp instanceof Binary) {
      return this._visitBinary(exp)
    }
  }

  interpret(expression) {
    return this._evaluate(expression)
  }

  _isTruthy(exp) {
    if (exp === null || exp === undefined) {
      return false
    } else if (exp === true || exp === false) {
      return exp
    } else {
      return true
    }
  }
}
