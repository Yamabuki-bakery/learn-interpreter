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

assignment     → (( call "." )? IDENTIFIER) | (call "[" expression "]"  ) "=" assignment
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
               
call           → primary ( "(" arguments? ")" | "." IDENTIFIER | "[" expression "]" )* ;
arguments      → assignment ( "," assignment )* ;

primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" 
               | IDENTIFIER 
               | funcExpr 
               | "super" "." IDENTIFIER ;
               | "[" arguments? "]"

funcExpr       → "fun" "(" parameters? ")" block ;
```

### Syntax design

#### Grammar additions

- Add tokens: LEFT_BRACKET "[" and RIGHT_BRACKET "]".
    
- Extend primary and call forms to support array literals and indexing.
    

Updated grammar fragments:

- 
```
primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" 
               | IDENTIFIER 
               | funcExpr 
               | "super" "." IDENTIFIER ;
               | "[" arguments? "]"
```
    
```
call → primary ( "(" arguments? ")" | "." IDENTIFIER | "[" expression "]" )* ;
```
    
    

Notes:

- Array literal is a primary expression so it can be used anywhere an expression is allowed.
    
- Indexing is part of the call chain so arr[0] and arr().foo[2] both work.
    
- Keep commas in comma / arguments rules unchanged; array elements use the same expression production.