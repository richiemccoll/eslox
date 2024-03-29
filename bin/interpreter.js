import {
  Assignment,
  Binary,
  Block,
  Call,
  Callable,
  Func,
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
import { TokenType } from './constants/token-type.js'
import { Environment } from './environment.js'
import { ReturnError, RuntimeError } from './errors.js'

export class Interpreter {
  constructor({ onError }) {
    this.environment = new Environment()
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

  _visitAssignment(exp) {
    const value = this._evaluate(exp.value)
    if (this.environment.get(exp.name.lexeme)) {
      return this.environment.define(exp.name.lexeme, value)
    }
    throw new RuntimeError('Undefined variable', exp.name ? exp.name : exp)
  }

  _visitPrintStmt(exp) {
    const value = this._evaluate(exp.expression)
    if (value instanceof Callable) {
      const output = value.toString()
      console.log(output)
      return output
    }
    console.log(JSON.stringify(value))
    return value
  }

  _visitStmt(exp) {
    return this._evaluate(exp.expression)
  }

  _visitVar(variable) {
    return this.environment.get(variable.name.lexeme)
  }

  _visitVarStmt(stmt) {
    let value = null
    if (stmt.initializer !== null) {
      value = this._evaluate(stmt.initializer)
    }

    this.environment.define(stmt.name.lexeme, value)
    return null
  }

  _visitBlock(exp) {
    this.interpretBlock(exp, new Environment(this.environment))
  }

  interpretBlock(block, env) {
    const prev = this.environment
    try {
      this.environment = env
      let result = this.interpret(block.statements)
      this.environment = prev
      return result
    } catch (error) {
      this.environment = prev
      throw error
    }
  }

  _visitIfStatement(stmt) {
    if (this._evaluate(stmt.condition)) {
      this._execute(stmt.thenBranch)
    } else if (stmt.elseBranch !== null) {
      this._execute(stmt.elseBranch)
    }

    return null
  }

  _visitWhileStatement(stmt) {
    while (this._evaluate(stmt.condition)) {
      this._execute(stmt.body)
    }
    return null
  }

  _visitLogical(exp) {
    const left = this._evaluate(exp.left)

    if (exp.operator.type === TokenType.OR) {
      if (left !== TokenType.NIL && left) {
        return left
      } else if (!left) {
        return left
      }
    }

    return this._evaluate(exp.right)
  }

  _visitCall(exp) {
    const callee = this._evaluate(exp.callee)
    const args = []
    exp.arguments.forEach(arg => {
      args.push(this._evaluate(arg))
    })

    if (!callee.call) {
      throw new RuntimeError('Can only call functions and classes')
    }

    return callee.call(this, args)
  }

  _visitFunction(exp) {
    const fn = new Callable(exp, this.environment)
    this.environment.define(exp.name.lexeme, fn)
  }

  _visitReturn(exp) {
    let value = null
    if (exp.value) {
      value = this._evaluate(exp.value)
    }
    throw new ReturnError(value)
  }

  _evaluate(exp) {
    if (exp instanceof Return) {
      return this._visitReturn(exp)
    }
    if (exp instanceof Func) {
      return this._visitFunction(exp)
    }
    if (exp instanceof Call) {
      return this._visitCall(exp)
    }
    if (exp instanceof Block) {
      return this._visitBlock(exp)
    }
    if (exp instanceof Assignment) {
      return this._visitAssignment(exp)
    }
    if (exp instanceof Stmt) {
      return this._visitStmt(exp)
    }
    if (exp instanceof PrintStmt) {
      return this._visitPrintStmt(exp)
    }
    if (exp instanceof Literal) {
      return this._visitLiteral(exp)
    }
    if (exp instanceof Unary) {
      return this._visitUnary(exp)
    }
    if (exp instanceof Var) {
      return this._visitVar(exp)
    }
    if (exp instanceof VarStmt) {
      return this._visitVarStmt(exp)
    }
    if (exp instanceof VarStmt) {
      return this._visitVarStmt(exp)
    }
    if (exp instanceof Binary) {
      return this._visitBinary(exp)
    }
    if (exp instanceof IfStmt) {
      return this._visitIfStatement(exp)
    }
    if (exp instanceof Logical) {
      return this._visitLogical(exp)
    }
    if (exp instanceof WhileStmt) {
      return this._visitWhileStatement(exp)
    }
  }

  interpret(statements) {
    try {
      if (Array.isArray(statements)) {
        for (let statement of statements) {
          return this._execute(statement)
        }
      }
    } catch (error) {
      if (error instanceof ReturnError) {
        return error.value
      } else {
        // TODO - how to get the line number?
        this.onError(0, error.message)
      }
    }
  }

  _execute(statement) {
    return this._evaluate(statement)
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
