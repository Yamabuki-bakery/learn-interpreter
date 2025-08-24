import { readFileSync } from "fs";
import { argv } from "process";
import { join } from "path";
import readInput, { closeInput } from "./utils/input";
import { Scanner } from "./Scanner";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { Parser } from "./Parser";
import { AstPrinter } from "./AstPrinter";

export let hadError = false;

export function main(): void {
  const args = argv.slice(2);
  if (args.length > 1) {
    console.error("Usage: tlox [file]");
    process.exit(64);
  } else if (args.length === 1) {
    runFile(args[0]);
  } else {
    void runPrompt();
  }
}

function runFile(file: string): void {
  const path = join(process.cwd(), file);
  const source = readFileSync(path, "utf-8");
  run(source);
  if (hadError) process.exit(65);
}

async function runPrompt(): Promise<void> {
  for (;;) {
    process.stdout.write("tlox > ");
    const line = await readInput();
    if (line === null) break;
    run(line);
    hadError = false;
  }
  // Clean up readline interface
  closeInput();
}

function run(source: string): void {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const expression = parser.parse();

  if (hadError) return;
  if (expression === null || expression === undefined) return;
  console.log(JSON.stringify(expression, null, 2));
  console.log(new AstPrinter().print(expression));
}

export function error(arg1: number | Token, arg2: string): void {
  if (typeof arg1 === "number") {
    report(arg1, "", arg2);
    return;
  }
  const token = arg1;
  const message = arg2;
  if (token.type === TokenType.EOF) {
    report(token.line, " at end", message);
  } else {
    report(token.line, ` at '${token.lexeme}'`, message);
  }
}

function report(line: number, where: string, message: string): void {
  console.error(`[line ${line.toString()}] Error${where}: ${message}`);
  hadError = true;
}
