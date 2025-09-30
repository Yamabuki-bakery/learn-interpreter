```bnf
program        → declaration* EOF ;

declaration    → classDecl
               | funDecl
               | varDecl
               | statement ;
               
classDecl      → "class" IDENTIFIER "{" function* "}" ;
               
funDecl        → "fun" function ;
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
               | funcExpr ;

funcExpr       → "fun" "(" parameters? ")" block ;
```

## [Properties on Instances](https://craftinginterpreters.com/classes.html#properties-on-instances)

We have instances, so we should make them useful. We’re at a fork in the road. We could add behavior first—methods—or we could start with state—properties. We’re going to take the latter because, as we’ll see, the two get entangled in an interesting way and it will be easier to make sense of them if we get properties working first.

Lox follows JavaScript and Python in how it handles state. Every instance is an open collection of named values. Methods on the instance’s class can access and modify properties, but so can outside code. Properties are accessed using a `.` syntax.


someObject.someProperty

An expression followed by `.` and an identifier reads the property with that name from the object the expression evaluates to. That dot has the same precedence as the parentheses in a function call expression, so we slot it into the grammar by replacing the existing `call` rule with:

```
call           → primary ( "(" arguments? ")" | "." IDENTIFIER )* ;
```
==“Property access” means we’ll call these “get expressions”.==

### [Get expressions](https://craftinginterpreters.com/classes.html#get-expressions)

The syntax tree node is:

      "Call     : Expr callee, Token paren, List<Expr> arguments",
      "Get      : Expr object, Token name",
      "Grouping : Expr expression",


Following the grammar, the new parsing code goes in our existing `call()` method.

```java
    while (true) { 
      if (match(LEFT_PAREN)) {
        expr = finishCall(expr);

      } else if (match(DOT)) {
        Token name = consume(IDENTIFIER,
            "Expect property name after '.'.");
        expr = new Expr.Get(expr, name);

      } else {
        break;
      }
    }
```

The outer `while` loop there corresponds to the `*` in the grammar rule. We zip along the tokens building up a chain of calls and gets as we find parentheses and dots, like so:

![](file-20250918213503386.jpg)

### [Set expressions](https://craftinginterpreters.com/classes.html#set-expressions)

Setters use the same syntax as getters, except they appear on the left side of an assignment.

```js
someObject.someProperty = value;
```

In grammar land, we extend the rule for assignment to allow dotted identifiers on the left-hand side.
```
assignment     → ( call "." )? IDENTIFIER "=" assignment
               | logic_or ;
```

Unlike getters, setters don’t chain. However, the reference to `call` allows any high-precedence expression before the last dot, including any number of _getters_, as in:

![](file-20250918213701566.jpg)

Note here that only the _last_ part, the `.meat` is the _setter_. The `.omelette` and `.filling` parts are both _get_ expressions.

==Looks like get all the way to the target object, and set on the field of it==

When parsing, the trick we do is parse the left-hand side as a normal Get expression. Then, when we stumble onto the equal sign after it, we take the expression we already parsed and transform it into the correct syntax tree node for the assignment.

然後從這個 get 身上提取俺們需要的 object 和 name

We add another clause to that transformation to handle turning an Expr.Get expression on the left into the corresponding Expr.Set.

```java
        return new Expr.Assign(name, value);
      } else if (expr instanceof Expr.Get) {
        Expr.Get get = (Expr.Get)expr;
        return new Expr.Set(get.object, get.name, value);
      }
```


That’s parsing our syntax. We push that node through into the resolver.

Again, like Expr.Get, the property itself is dynamically evaluated, so there’s nothing to resolve there. All we need to do is recurse into the two subexpressions of Expr.Set, the object whose property is being set, and the value it’s being set to.

Interpreter

```java
 @Override
  public Object visitSetExpr(Expr.Set expr) {
    Object object = evaluate(expr.object);

    if (!(object instanceof LoxInstance)) { 
      throw new RuntimeError(expr.name,
                             "Only instances have fields.");
    }

    Object value = evaluate(expr.value);
    ((LoxInstance)object).set(expr.name, value);
    return value;
  }
```

## This

```bnf
program        → declaration* EOF ;

declaration    → classDecl
               | funDecl
               | varDecl
               | statement ;
               
classDecl      → "class" IDENTIFIER "{" method* "}" ;
               
funDecl        → "fun" function ;
method         → "class"? function
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
               | funcExpr ;

funcExpr       → "fun" "(" parameters? ")" block ;
```

## Steps to add static method support:

1. Add syntax and new stmt AST node type
2. Add parser support to yield Class node with static methods
3. Resolver: add function type
4. Resolver: in visitClassStmt, resolve static methods
5. LoxClass: copy get and set from LoxInstance
6. Interpreter: Create class stmt runtime representation with static methods
7. Interpreter: Fix some instanceof type check statement in visitGetExpr and visitSetExpr