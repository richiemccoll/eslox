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
  constructor({ operator, expr }) {
    this.operator = operator
    this.expr = expr
  }

  accept() {
    console.log('Unary - accept() - TODO needs implementing')
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

export { Binary, Grouping, Literal, Unary }
