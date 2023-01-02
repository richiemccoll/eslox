class Binary {
  constructor({ left, operator, right }) {
    this.left = left
    this.operator = operator
    this.right = right
  }
}

class Unary {
  constructor({ operator, expr }) {
    this.operator = operator
    this.expr = expr
  }
}

class Literal {
  constructor(value) {
    this.val = value
  }
}

class Grouping {
  constructor(exp) {
    this.exp = exp
  }
}

export { Binary, Grouping, Literal, Unary }
