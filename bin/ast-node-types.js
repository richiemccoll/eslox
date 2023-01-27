import { Environment } from './environment.js'

class Binary {
  constructor({ left, operator, right }) {
    this.left = left
    this.operator = operator
    this.right = right
  }

  accept() {
    console.log('Binary - accept() - TODO needs implementing')
  }
}

class Unary {
  constructor({ operator, right }) {
    this.operator = operator
    this.right = right
  }
}

class Literal {
  constructor(value) {
    this.val = value
  }

  accept() {
    if (this.val && this.val !== 'nil') {
      return this.val
    }
    if (this.val === false) {
      return this.val
    }
    return 'nil'
  }
}

class Grouping {
  constructor(exp) {
    this.exp = exp
  }

  accept() {
    console.log('Grouping - accept() - TODO needs implementing')
  }
}

class Stmt {
  constructor(exp) {
    this.expression = exp
  }
}

class PrintStmt {
  constructor(exp) {
    this.expression = exp
  }
}

class VarStmt {
  constructor(name, initializer) {
    this.name = name
    this.initializer = initializer
  }
}

class Var {
  constructor(name) {
    this.name = name
  }
}

class Assignment {
  constructor(name, value) {
    this.name = name
    this.value = value
  }
}

class Block {
  constructor(statements, context = 'regular') {
    this.statements = statements
    this.context = context
  }
}

class IfStmt {
  constructor(condition, thenBranch, elseBranch) {
    this.condition = condition
    this.thenBranch = thenBranch
    this.elseBranch = elseBranch
  }
}

class Logical {
  constructor(left, operator, right) {
    this.left = left
    this.operator = operator
    this.right = right
  }
}

class WhileStmt {
  constructor(condition, body) {
    this.condition = condition
    this.body = body
  }
}

class Call {
  constructor(callee, paren, args) {
    this.callee = callee
    this.paren = paren
    this.arguments = args
  }
}

class Callable {
  constructor(declaration, closure) {
    this.declaration = declaration
    this.closure = closure
  }

  call(interpreter, args) {
    const environment = new Environment(this.closure)
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].name.lexeme, args[i])
    }

    try {
      const block = interpreter.interpretBlock(
        { statements: this.declaration.body },
        environment
      )
      return block
    } catch (error) {
      console.error(error)
    }
    return null
  }

  toString() {
    return `<${this.declaration.name.lexeme}()>`
  }
}

class Func {
  constructor(name, params, body) {
    this.name = name
    this.params = params
    this.body = body
  }
}

class Return {
  constructor(keyword, value) {
    this.keyword = keyword
    this.value = value
  }
}

export {
  Assignment,
  Binary,
  Block,
  Call,
  Callable,
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
}
