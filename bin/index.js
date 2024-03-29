import process from 'node:process'
import { ESLox } from './ESLox.js'

function main() {
  const args = process.argv.slice(2)
  const cliArgs = Array.isArray(args) ? args : [args]
  const eslox = new ESLox()

  if (cliArgs.length > 1) {
    eslox.printUsage()
  } else if (cliArgs.length === 1) {
    eslox.runFile(cliArgs[0])
  } else {
    eslox.runPrompt()
  }
}

main()
