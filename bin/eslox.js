import readline from 'node:readline'
import { Interpreter } from './interpreter.js'
import { Parser } from './parser.js'
import { Scanner } from './scanner.js'

export class ESLox {
  constructor() {
    this.error = false
    this.interpreter = new Interpreter()
  }

  handleError(line, message) {
    this.reportError(line, '', message)
  }

  reportError(line, where, message) {
    console.error('[line ' + line + '] Error' + where + ': ' + message)
    this.error = true
  }

  parseTokens(tokens) {
    const parser = new Parser({
      onError: this.handleError.bind(this)
    })
    return parser.parse(tokens)
  }

  scanSource(source) {
    const scanner = new Scanner({
      source,
      onError: this.handleError.bind(this)
    })
    const tokens = scanner.scanTokens(source)
    return tokens
  }

  run(source) {
    const tokens = this.scanSource(source)
    const expression = this.parseTokens(tokens)
    const result = this.interpreter.interpret(expression)
    return result
  }

  runFile() {
    if (this.error) {
      process.exit(65)
    }
  }

  runPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    })

    rl.prompt()

    rl.on('line', line => {
      this.run(line)
      // If the user makes a mistake, it shouldn’t kill their entire session.
      this.error = false
      rl.prompt()
    })
  }

  printUsage() {
    console.log('Usage eslox [script]')
    process.exit(64)
  }
}
