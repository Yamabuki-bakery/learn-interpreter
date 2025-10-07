```bnf
program        → declaration* EOF ;

declaration    → classDecl
               | funDecl
               | varDecl
               | statement ;
               
classDecl      → "class" IDENTIFIER ( "<" IDENTIFIER )?
                 "{" method* "}" ;
               
funDecl        → "fun" function ;
method         → "static"? function
function       → IDENTIFIER "(" parameters? ")" block ;
parameters     → IDENTIFIER ( "," IDENTIFIER )* ;

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

assignment     → ( call "." )? IDENTIFIER "=" assignment
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
               
call           → primary ( "(" arguments? ")" | "." IDENTIFIER )* ;
arguments      → expression ( "," expression )* ;

primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" 
               | IDENTIFIER 
               | funcExpr 
               | "super" "." IDENTIFIER ;

funcExpr       → "fun" "(" parameters? ")" block ;
```

## Where to find super class?

![](file-20251007202056576.jpg)

在 define 各個 methods 之前，先綁定一個新 env，把 super 當作變量塞進去。