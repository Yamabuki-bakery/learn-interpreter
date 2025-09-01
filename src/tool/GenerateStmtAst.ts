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
      "Print      - expression: Expr",
      "Var        - name: Token, initializer: Expr | null",
    ],
    imports,
  );
}

main();
// pnpx tsx GenerateStmtAst.ts ../generated
