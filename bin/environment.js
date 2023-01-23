import { RuntimeError } from './errors.js'

class Environment {
  constructor(enclosing = null) {
    this.values = new Map()
    this.enclosing = enclosing
  }

  define(name, value) {
    this.values.set(name, value)

    if (this.enclosing !== null) {
      return this.enclosing.set(name, value)
    }
  }

  get(name) {
    if (this.values.get(name)) {
      return this.values.get(name)
    }

    // Walk the scope chain by checking each
    // enclosing scope
    if (this.enclosing !== null) {
      return this.enclosing.get(name)
    }

    // If we've walked the scope chain and there the variable
    // can't be found, then we know it's a runtime error
    throw new RuntimeError(`Undefined variable ${name}`)
  }
}

export { Environment }
