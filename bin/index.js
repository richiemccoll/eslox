import fs from "node:fs";
import process from "node:process";
import readline from "readline";
import { Scanner } from "./scanner.js";

class JSLox {
  compilationError = false;

  error(line, message) {
    report(line, "", message);
  }

  report(line, where, message) {
    console.error("[line " + line + "] Error" + where + ": " + message);
    this.compilationError = true;
  }

  run(source) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens(source);
    tokens.forEach((token) => console.log(token));
  }

  runFile(path) {
    if (this.compilationError) {
      process.exit(65);
    }
  }

  runPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });

    rl.prompt();

    rl.on("line", (line) => {
      this.run(line);
      // If the user makes a mistake, it shouldn’t kill their entire session.
      this.compilationError = false;
      rl.prompt();
    });
  }

  printUsage() {
    console.log("Usage jslox [script]");
    process.exit(64);
  }
}

function main() {
  const [_, __, ...args] = process.argv;
  const cliArgs = Array.isArray(args) ? args : [args];
  const compiler = new JSLox();

  if (cliArgs.length > 1) {
    compiler.printUsage();
  } else if (cliArgs.length === 1) {
    compiler.runFile(cliArgs[0]);
  } else {
    compiler.runPrompt();
  }
}

main();
