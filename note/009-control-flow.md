```bnf
program        → declaration* EOF ;

declaration    → varDecl
               | statement ;
               
varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

statement      → exprStmt
               | forStmt
               | ifStmt
               | printStmt
               | whileStmt
               | block ;
		       
forStmt        → "for" "(" ( varDecl | exprStmt | ";" )
                 expression? ";"
                 expression? ")" statement ;
		       
whileStmt      → "while" "(" expression ")" statement ;

ifStmt         → "if" "(" expression ")" statement
               ( "else" statement )? ;
               
block          → "{" declaration* "}" ;

exprStmt       → expression ";" ;
printStmt      → "print" expression ";" ;

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
               | primary ;
primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" 
               | IDENTIFIER ;
```

## Desugaring for loop

In other words, Lox doesn’t _need_ `for` loops, they just make some common code patterns more pleasant to write. These kinds of features are called **syntactic sugar**. For example, the previous `for` loop could be rewritten like so:

```js
{
  var i = 0;
  while (i < 10) {
    print i;
    i = i + 1;
  }
}
```



## [Challenges](https://craftinginterpreters.com/control-flow.html#challenges)

1. A few chapters from now, when Lox supports first-class functions and dynamic dispatch, we technically won’t _need_ branching statements built into the language. Show how conditional execution can be implemented in terms of those. Name a language that uses this technique for its control flow.
    
2. Likewise, looping can be implemented using those same tools, provided our interpreter supports an important optimization. What is it, and why is it necessary? Name a language that uses this technique for iteration.
    
3. Unlike Lox, most other C-style languages also support `break` and `continue` statements inside loops. Add support for `break` statements.
    
    The syntax is a `break` keyword followed by a semicolon. It should be a syntax error to have a `break` statement appear outside of any enclosing loop. At runtime, a `break` statement causes execution to jump to the end of the nearest enclosing loop and proceeds from there. Note that the `break` may be nested inside other blocks and `if` statements that also need to be exited.


### 🧠 Challenge 1: Conditional Execution via Functions and Dispatch

**Prompt:**

> Show how conditional execution can be implemented in terms of first-class functions and dynamic dispatch. Name a language that uses this technique.

**Solution:**

Once Lox supports first-class functions and dynamic dispatch (coming in later chapters), you can simulate `if` statements using function calls and closures. Here's how:

```lox
fun ifThenElse(condition, thenBranch, elseBranch) {
  if (condition) {
    thenBranch();
  } else {
    elseBranch();
  }
}

ifThenElse(a > b, 
  fun () { print "a is greater"; }, 
  fun () { print "b is greater or equal"; });
```

This mimics conditional execution by passing behavior (as functions) rather than syntax. The key is that functions are first-class citizens—you can pass them around and invoke them dynamically.

**Language Example:**  
Smalltalk and JavaScript both use this technique. In JavaScript, for example, you often see conditional logic embedded in callbacks or higher-order functions.

---

### 🔁 Challenge 2: Looping via Functions and Tail Call Optimization

**Prompt:**

> Looping can be implemented using those same tools, provided our interpreter supports an important optimization. What is it, and why is it necessary? Name a language that uses this technique.

**Solution:**

You can simulate loops using recursion. But to avoid stack overflow, the interpreter must support **Tail Call Optimization (TCO)**—an optimization where the interpreter reuses the current stack frame for tail-recursive calls.

Example in a hypothetical Lox-like language:

```lox
fun loop(n) {
  if (n <= 0) return;
  print n;
  loop(n - 1); // Tail call
}
loop(10);
```

Without TCO, each recursive call adds a new frame to the call stack, which can crash for large `n`. With TCO, the interpreter reuses the same frame, making recursion as efficient as iteration.

**Language Example:**  
Scheme is a classic example—it relies heavily on recursion and mandates TCO in its spec. Functional languages like Haskell and OCaml also optimize tail calls.

---

### 3

```bnf
program        → declaration* EOF ;

declaration    → varDecl
               | statement ;
               
varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

statement      → exprStmt
               | forStmt
               | ifStmt
               | printStmt
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
               | primary ;
primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" 
               | IDENTIFIER ;
```