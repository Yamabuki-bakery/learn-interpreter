import { createWriteStream, WriteStream } from "fs";
import { argv } from "process";

let writer: WriteStream;

export function main(): void {
  const args = argv.slice(2);
  if (args.length != 1) {
    console.error("Usage: generate_ast <output directory>");
    process.exit(64);
  }
  const outputDir = args[0];
  defineAst(outputDir, "Expr", [
    "Binary   - left: Expr, operator: Token, right: Expr",
    "Grouping - expression: Expr",
    "Literal  - value: any",
    "Unary    - operator: Token, right: Expr",
  ]);
}

function writeLine(line: string): void {
  writer.write(line + "\n");
}

function defineAst(outputDir: string, baseName: string, types: string[]): void {
  const path = outputDir + "/" + baseName + ".ts";
  writer = createWriteStream(path, { flags: "w", encoding: "utf-8" });

  writeLine("/* eslint-disable @typescript-eslint/no-unused-vars */");
  writeLine("/* eslint-disable @typescript-eslint/no-explicit-any */");
  writeLine('import { Token } from "../Token";');
  writeLine(`export interface ${baseName} {
  accept(visitor: Visitor<any>): any;  
}`);
  writeLine("");
  defineVisitor(baseName, types);
  writeLine("");

  types.forEach((type) => {
    const className = type.split("-")[0].trim();
    const fields = type.split("-")[1].trim();
    defineType(baseName, className, fields);
  });

  writer.close();
}

function defineVisitor(baseName: string, types: string[]): void {
  writeLine(`export interface Visitor<T> {`);
  types.forEach((type) => {
    const className = type.split("-")[0].trim();
    writeLine(`  visit${className}${baseName}(${baseName.toLowerCase()}: ${className}): T;`);
  });
  writeLine("}");
}

function defineType(
  baseName: string,
  className: string,
  fieldList: string,
): void {
  const definition = `
export class ${className} implements ${baseName} {
  constructor (${fieldList
    .split(",")
    .map((field) => `readonly ${field.trim()}`)
    .join(', ')}) { }

  accept(visitor: Visitor<any>): any {
    return visitor.visit${className}${baseName}(this);
  }
}`;

  writeLine(definition);
}

main();

// pnpx tsx GenerateAst.ts ../generated

// abstract class Expr {
//   static class Binary extends Expr {
//     Binary(Expr left, Token operator, Expr right) {
//       this.left = left;
//       this.operator = operator;
//       this.right = right;
//     }

//     final Expr left;
//     final Token operator;
//     final Expr right;
//   }

//   // Other expressions...
// }
