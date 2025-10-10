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
    'import { Stmt } from "./Stmt";',
  ];
  defineAst(outputDir, "Expr", [
    "Assign   - name: Token, value: Expr",
    "Binary   - left: Expr, operator: Token, right: Expr",
    "Ternary  - condition: Expr, thenBranch: Expr, elseBranch: Expr",
    "Grouping - expression: Expr",
    "Literal  - value: LiteralTypes",
    "Logical  - left: Expr, operator: Token, right: Expr",
    "This     - keyword: Token",
    "Super    - keyword: Token, method: Token",
    "Unary    - operator: Token, right: Expr",
    "Call     - callee: Expr, paren: Token, args: Expr[]",
    "Get      - object: Expr, name: Token",
    "Set      - object: Expr, name: Token, value: Expr",
    "GetIndex - object: Expr, bracket: Token, index: Expr",
    "SetIndex - object: Expr, bracket: Token, index: Expr, value: Expr",
    // "Array    - elements: Expr[], bracket: Token",
    "Variable - name: Token",
    "Function - params: Token[], body: Stmt[]",
  ], imports);
}

main();
// pnpx tsx GenerateExprAst.ts ../generated
