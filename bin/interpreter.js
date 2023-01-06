import { Literal, Unary } from './constants/ast-node-types'
import { TokenType } from './constants/token-type'

export class Interpreter {
  // A literal is a bit of syntax that produces a value.
  // convert the literal tree node from the parser into a runtime value.
  _visitLiteral(exp) {
    return exp.accept(this)
  }

  visitGrouping(exp) {
    // TODO - implement accept
    return this.evaluate(exp.expression)
  }

  _visitUnary(exp) {
    const right = this._evaluate(exp.right)

    switch (exp.operator.type) {
      case TokenType.MINUS: {
        return -right
      }
      case TokenType.BANG: {
        return !this.isTruthy(right)
      }
    }
    // Unreachable.
    return null
  }

  _evaluate(exp) {
    if (exp instanceof Literal) {
      return this._visitLiteral(exp)
    }
    if (exp instanceof Unary) {
      return this._visitUnary(exp)
    }
  }

  interpret(expression) {
    return this._evaluate(expression)
  }

  isTruthy(exp) {
    if (exp === null || exp === undefined) {
      return false
    } else if (exp === true || exp === false) {
      return exp
    } else {
      return true
    }
  }
}
