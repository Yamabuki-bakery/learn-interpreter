
```bnf
program        → declaration* EOF ;

declaration    → funDecl
               | varDecl
               | statement ;
               
funDecl        → "fun" function ;
function       → IDENTIFIER "(" parameters? ")" block ;
               
varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

statement      → exprStmt
               | forStmt
               | ifStmt
               | printStmt
               | returnStmt
               | whileStmt
               | breakStmt
               | continueStmt
               | block ;
		       
forStmt        → "for" "(" ( varDecl | exprStmt | ";" )
                 expression? ";"
                 expression? ")" statement ;
		       
whileStmt      → "while" "(" expression ")" statement ;

ifStmt         → "if" "(" expression ")" statement
               ( "else" statement )? ;
               
               
breakStmt      → "break" ";" ;
continueStmt   → "continue" ";" ;

block          → "{" declaration* "}" ;

exprStmt       → expression ";" ;
printStmt      → "print" expression ";" ;
returnStmt     → "return" expression? ";" ;

expression     → comma ;

comma          → assignment ( "," assignment )*;

assignment     → IDENTIFIER "=" assignment
               | conditional ;

conditional    → logic_or ( "?" expression ":" conditional )? ;

logic_or       → logic_and ( "or" logic_and )* ;
logic_and      → equality ( "and" equality )* ;

equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary
               | call ;
               
call           → primary ( "(" arguments? ")" )* ;
arguments      → expression ( "," expression )* ;

primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" 
               | IDENTIFIER ;
```