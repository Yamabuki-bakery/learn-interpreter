import { readFileSync } from "fs";
import { argv } from "process";
import { join } from "path";
import readInput, { closeInput } from "./utils/input";

const args = argv.slice(2);

function main() {
	if (args.length > 1) {
		console.error("Usage: tlox [file]");
		process.exit(64);
	} else if (args.length === 1) {
		runFile(args[0]);
	} else {
		void runPrompt();
	}
}

function runFile(file: string) {
	const path = join(process.cwd(), file);
	const source = readFileSync(path, "utf-8");
	run(source);
}

async function runPrompt() {
	for (;;) {
    process.stdout.write("tlox > ");
    const input = await readInput();
    if (input === null) {
      break;
    } else if (input.trim() === "") {
      continue; // Skip empty input
    }
    run(input);
  }
  // Clean up readline interface
  closeInput();
}

function run(source: string) {
	throw new Error("Not implemented yet");
}

main();
