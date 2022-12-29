import process from 'node:process'
import { JSLox } from './jslox.js'

function main() {
  const args = process.argv.slice(2)
  const cliArgs = Array.isArray(args) ? args : [args]
  const jslox = new JSLox()

  if (cliArgs.length > 1) {
    jslox.printUsage()
  } else if (cliArgs.length === 1) {
    jslox.runFile(cliArgs[0])
  } else {
    jslox.runPrompt()
  }
}

main()
