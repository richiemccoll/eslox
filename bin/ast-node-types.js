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

export {
  Assignment,
  Binary,
  Block,
  Grouping,
  Literal,
  PrintStmt,
  Stmt,
  Unary,
  Var,
  VarStmt
}
