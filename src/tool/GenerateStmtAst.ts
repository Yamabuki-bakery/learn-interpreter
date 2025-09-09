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
    'import { Expr } from "./Expr";',
    'import { Token } from "../Token";',
  ];
  defineAst(
    outputDir,
    "Stmt",
    [
      "Block      - statements: Stmt[]",
      "Expression - expression: Expr",
      "If         - condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null",
      "Print      - expression: Expr",
      "Return     - keyword: Token, value: Expr | null",
      "Function   - name: Token, params: Token[], body: Stmt[]",
      "Var        - name: Token, initializer: Expr | null",
      "While      - condition: Expr, body: Stmt",
      "Break      - keyword: Token",
      "Continue   - keyword: Token",
    ],
    imports,
  );
}

main();
// pnpx tsx GenerateStmtAst.ts ../generated
