import readline from 'readline'
import { Scanner } from './scanner.js'

export class JSLox {
  constructor() {
    this.error = false
  }

  handleError(line, message) {
    this.reportError(line, '', message)
  }

  reportError(line, where, message) {
    console.error('[line ' + line + '] Error' + where + ': ' + message)
    this.error = true
  }

  run(source) {
    const scanner = new Scanner({
      source,
      onError: this.handleError.bind(this)
    })
    const tokens = scanner.scanTokens(source)
    console.log('run()', tokens)
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
    console.log('Usage jslox [script]')
    process.exit(64)
  }
}
