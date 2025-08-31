## Statement rules:

```bnf
program        → declaration* EOF ;

declaration    → varDecl
               | statement ;
               
varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;

statement      → exprStmt
               | printStmt ;

exprStmt       → expression ";" ;
printStmt      → "print" expression ";" ;

expression     → comma ;

assignment     → IDENTIFIER "=" assignment
               | equality ;

comma          → select ( "," select )*;
conditional    → equality ( "?" expression ":" conditional )? ;
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

Declaration statements go under the new `declaration` rule. Right now, it’s only variables, but later it will include functions and classes. Any place where a declaration is allowed also allows non-declaring statements, so the `declaration` rule falls through to `statement`. Obviously, you can declare stuff at the top level of a script, so `program` routes to the new rule.


## The Assign Rule

That little `=` syntax is more complex than it might seem. Like most C-derived languages, assignment is an expression and not a statement. As in C, it is the lowest precedence expression form. That means the rule slots between `expression` and `equality` (the next lowest precedence expression).

In some other languages, like Pascal, Python, and Go, assignment is a statement.

expression     → assignment ;
assignment     → IDENTIFIER "=" assignment
               | equality ;

This says an `assignment` is either an identifier followed by an `=` and an expression for the value, or an `equality` (and thus any other) expression. Later, `assignment` will get more complex when we add property setters on objects, like:

instance.field = "value";

The easy part is adding the new syntax tree node.

```java
    defineAst(outputDir, "Expr", Arrays.asList(

      "Assign   : Token name, Expr value",

      "Binary   : Expr left, Token operator, Expr right",
```

_tool/GenerateAst.java_, in _main_()

The generated code for the new node is in [Appendix II](https://craftinginterpreters.com/appendix-ii.html#assign-expression).

It has a token for the variable being assigned to, and an expression for the new value. After you run the AstGenerator to get the new Expr.Assign class, swap out the body of the parser’s existing `expression()` method to match the updated rule.

```ts
  private Expr expression() {

    return assignment();

  }
```

_lox/Parser.java_, in _expression_(), replace 1 line

Here is where it gets tricky. A single token lookahead recursive descent parser can’t see far enough to tell that it’s parsing an assignment until _after_ it has gone through the left-hand side and stumbled onto the `=`. You might wonder why it even needs to. After all, we don’t know we’re parsing a `+` expression until after we’ve finished parsing the left operand.

The difference is that the left-hand side of an assignment isn’t an expression that evaluates to a value. It’s a sort of pseudo-expression that evaluates to a “thing” you can assign to. Consider:

var a = "before";
a = "value";

On the second line, we don’t _evaluate_ `a` (which would return the string “before”). We figure out what variable `a` refers to so we know where to store the right-hand side expression’s value. The [classic terms](https://en.wikipedia.org/wiki/Value_\(computer_science\)#lrvalue) for these two constructs are **l-value** and **r-value**. All of the expressions that we’ve seen so far that produce values are r-values. An l-value “evaluates” to a storage location that you can assign into.

In fact, the names come from assignment expressions: _l_-values appear on the _left_ side of the `=` in an assignment, and _r_-values on the _right_.

We want the syntax tree to reflect that an l-value isn’t evaluated like a normal expression. That’s why the Expr.Assign node has a _Token_ for the left-hand side, not an Expr. The problem is that the parser doesn’t know it’s parsing an l-value until it hits the `=`. In a complex l-value, that may occur many tokens later.

makeList().head.next = node;

Since the receiver of a field assignment can be any expression, and expressions can be as long as you want to make them, it may take an _unbounded_ number of tokens of lookahead to find the `=`.

We have only a single token of lookahead, so what do we do? We use a little trick, and it looks like this:

```ts
  private Expr assignment() {
    Expr expr = equality();

    if (match(EQUAL)) {
      Token equals = previous();
      Expr value = assignment();

      if (expr instanceof Expr.Variable) {
        Token name = ((Expr.Variable)expr).name;
        return new Expr.Assign(name, value);
      }

      error(equals, "Invalid assignment target."); 
    }

    return expr;
  }
```

_lox/Parser.java_, add after _expressionStatement_()

Most of the code for parsing an assignment expression looks similar to that of the other binary operators like `+`. We parse the left-hand side, which can be any expression of higher precedence. If we find an `=`, we parse the right-hand side and then wrap it all up in an assignment expression tree node.

We _report_ an error if the left-hand side isn’t a valid assignment target, but we don’t _throw_ it because the parser isn’t in a confused state where we need to go into panic mode and synchronize.

One slight difference from binary operators is that we don’t loop to build up a sequence of the same operator. Since assignment is right-associative, we instead recursively call `assignment()` to parse the right-hand side.

The trick is that right before we create the assignment expression node, we look at the left-hand side expression and figure out what kind of assignment target it is. We convert the r-value expression node into an l-value representation.

This conversion works because it turns out that every valid assignment target happens to also be valid syntax as a normal expression. Consider a complex field assignment like:

You can still use this trick even if there are assignment targets that are not valid expressions. Define a **cover grammar**, a looser grammar that accepts all of the valid expression _and_ assignment target syntaxes. When you hit an `=`, report an error if the left-hand side isn’t within the valid assignment target grammar. Conversely, if you _don’t_ hit an `=`, report an error if the left-hand side isn’t a valid _expression_.

```
newPoint(x + 2, 0).y = 3;
```

The left-hand side of that assignment could also work as a valid expression.

```
newPoint(x + 2, 0).y;
```

The first example sets the field, the second gets it.

This means we can parse the left-hand side _as if it were_ an expression and then after the fact produce a syntax tree that turns it into an assignment target. If the left-hand side expression isn’t a valid assignment target, we fail with a syntax error. That ensures we report an error on code like this:

```
a + b = c;
```

Way back in the parsing chapter, I said we represent parenthesized expressions in the syntax tree because we’ll need them later. This is why. We need to be able to distinguish these cases:

```
a = 3;   // OK.
(a) = 3; // Error.
```

Right now, the only valid target is a simple variable expression, but we’ll add fields later. The end result of this trick is an assignment expression tree node that knows what it is assigning to and has an expression subtree for the value being assigned. All with only a single token of lookahead and no backtracking.

### [8 . 4 . 2](https://craftinginterpreters.com/statements-and-state.html#assignment-semantics)