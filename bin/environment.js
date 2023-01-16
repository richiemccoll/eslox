import { RuntimeError } from './errors'

class Environment {
  constructor() {
    this.values = new Map()
  }

  define(name, value) {
    this.values.set(name, value)
  }

  get(name) {
    if (this.values.get(name)) {
      return this.values.get(name)
    }

    throw new RuntimeError(`Undefined variable ${name.lexme}`)
  }
}

export { Environment }
