import { Binary, Literal, Unary } from './ast-node-types'
import { TokenType } from './constants/token-type'
import { RuntimeError } from './errors'

export class Interpreter {
  constructor({ onError }) {
    this.onError = onError
  }

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
        this._checkNumber(exp.operator, right)
        return left - right
      }
      case TokenType.SLASH: {
        this._checkNumber(exp.operator, left, right)
        return left / right
      }
      case TokenType.STAR: {
        this._checkNumber(exp.operator, left, right)
        return left * right
      }
      case TokenType.PLUS: {
        // since we're in JS land...
        // the + operator is overloaded to support both adding numbers
        // and concatenating strings
        return left + right
      }
      case TokenType.GREATER: {
        this._checkNumber(exp.operator, left, right)
        return left > right
      }
      case TokenType.GREATER_EQUAL: {
        this._checkNumber(exp.operator, left, right)
        return left >= right
      }
      case TokenType.LESS: {
        this._checkNumber(exp.operator, left, right)
        return left < right
      }
      case TokenType.LESS_EQUAL: {
        this._checkNumber(exp.operator, left, right)
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
    try {
      return this._evaluate(expression)
    } catch (error) {
      // TODO - how to get the line number?
      this.onError(0, error.message)
    }
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

  _checkNumber(operator, ...operands) {
    for (let i = 0; i < operands.length; i++) {
      let operand = operands[i]

      if (typeof operand !== 'number') {
        let left = operands[0]
        let right = operands[1]
        const isLeft = operand === left
        const isRight = operand === right
        if (isLeft) {
          throw new RuntimeError(
            `Left hand side of ${operator.type} sign must be a number - Found ${operand}`,
            operator
          )
        }
        if (isRight) {
          throw new RuntimeError(
            `Right hand side of ${operator.type} sign must be a number - Found ${operand}`,
            operator
          )
        }

        throw new RuntimeError(
          `Operand must be a number - Found ${operand}`,
          operator
        )
      }
    }
  }
}
