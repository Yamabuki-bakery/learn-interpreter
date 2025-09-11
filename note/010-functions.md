
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
               | IDENTIFIER 
               | funcExpr ;

funcExpr       → "fun" "(" parameters? ")" block ;
```

## Learning

### Implementing closure

Capture the current environment when the function is defined:

```js
  visitFunctionStmt(stmt: Function): void {
    const func = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, func);
    return;
  }
  visitFunctionExpr(expr: FuncExpr): unknown {
    return new LoxFunction(expr, this.environment);
  }
```
And use this env when called:

```js
  call(interpreter: Interpreter, args: unknown[]): unknown {
    const environment = new Environment(this.closure);
    args.forEach((arg, i) => {
      environment.define(this.declaration.params[i].lexeme, arg);
    });

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (error) {
      if (error instanceof ReturnException) {
        return error.value;
      }
      throw error;
    }
    return null;
  }
```

Also, the passed args are re-defined in the current environment.

## 🧠 Challenge 1: Why don’t Smalltalk implementations suffer the performance cost of runtime arity checking?

### 🔍 The Problem

Lox checks at runtime whether the number of arguments passed to a function matches the number of parameters it expects. This adds overhead. Smalltalk doesn’t seem to have this issue.

### ✅ The Insight

Smalltalk is a **message-passing** language. When you call a method, you're sending a message to an object. The method name itself encodes the number of arguments. For example:

```smalltalk
object doSomethingWith: arg1 and: arg2
```

This method name is `doSomethingWith:and:` — it _requires_ two arguments. If you send a message with the wrong number of arguments, it’s a **different message** entirely and won’t match any method.

### 💡 Why It’s Efficient

- **Method lookup is based on the full selector**, which includes argument count.
- **No need for runtime arity checking** — mismatched calls simply fail to resolve.
- This shifts the burden to the **method dispatch system**, which is already optimized.

### 🛠️ How to Apply This

Lox could theoretically encode arity into function identifiers or use a similar dispatch mechanism, but that would complicate its design. Instead, it opts for a simpler runtime check.

---

## 🧪 Challenge 3: Are parameters in the same scope as local variables?

### 🧩 The Question

```lox
fun scope(a) {
  var a = "local";
}
```

Is this valid? Does the parameter `a` conflict with the local variable `a`?

### ✅ What Lox Does

Lox **allows** this. The local variable `a` shadows the parameter. So inside the function body, `a` refers to `"local"`.

### 🔍 Other Languages

- **JavaScript**: Allows shadowing — same behavior as Lox.
- **Python**: Also allows shadowing.
- **Java/C++**: Parameters and local variables share the same scope — redeclaring causes a compile-time error.

### 💡 What Should a Language Do?

It depends on philosophy:

- **Shadowing-friendly languages** (like Lox, JS, Python) prioritize flexibility.
- **Strict languages** (like Java) prefer clarity and avoid accidental shadowing.

### 🛠️ How to Handle in Lox

No changes needed — just be aware that shadowing is allowed. If you want to prevent it, you’d need to add a semantic check during resolution to disallow redeclaration of parameters.
