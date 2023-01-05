export class Interpreter {
  // A literal is a bit of syntax that produces a value.
  // convert the literal tree node from the parser into a runtime value.
  visitLiteral(exp) {
    return exp.value
  }
  visitGrouping(exp) {
    // TODO - implement accept
    return this.evaluate(exp.expression)
  }

  evaluate(exp) {
    return exp.accept(this)
  }

  interpret(expression) {
    return this.evaluate(expression)
  }
}
