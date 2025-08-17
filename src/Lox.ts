import { readFileSync } from "fs";
import { argv } from "process";
import { join } from "path";
import readInput, { closeInput } from "./utils/input";
import { Scanner } from "./Scanner";


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

	for (const token of tokens) {
		console.log(token.toString());
	}
}

export function error(line: number, message: string): void {
	report(line, "", message);
}

function report(line: number, where: string, message: string): void {
	console.error(`[line ${line.toString()}] Error${where}: ${message}`);
	hadError = true;
}
