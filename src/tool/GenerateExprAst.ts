import { argv } from "process";
import { defineAst } from "./DefineAst";

export function main(): void {
  const args = argv.slice(2);
  if (args.length != 1) {
    console.error("Usage: generate_ast <output directory>");
    process.exit(64);
  }
  const outputDir = args[0];
  const imports = [
    'import { LiteralTypes } from "../LiteralTypes";',
    'import { Token } from "../Token";',
  ];
  defineAst(outputDir, "Expr", [
    "Assign   - name: Token, value: Expr",
    "Binary   - left: Expr, operator: Token, right: Expr",
    "Ternary  - condition: Expr, thenBranch: Expr, elseBranch: Expr",
    "Grouping - expression: Expr",
    "Literal  - value: LiteralTypes",
    "Unary    - operator: Token, right: Expr",
    "Variable - name: Token",
  ], imports);
}

main();
// pnpx tsx GenerateExprAst.ts ../generated
