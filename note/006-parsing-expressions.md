
## Priority (precedence) of the expressions

|Name|Operators|Associates|
|---|---|---|
|Equality|`==` `!=`|Left|
|Comparison|`>` `>=` `<` `<=`|Left|
|Term|`-` `+`|Left|
|Factor|`/` `*`|Left|
|Unary|`!` `-`|Right|

We can have the grammar:

```
expression     → ...
equality       → ...
comparison     → ...
term           → ...
factor         → ...
unary          → ...
primary        → ...
```

---
![](file-20250821221740344.jpg)
### 🧭 “Down” in Grammar ≠ “Down” in AST

In a **top-down parser**, “down” refers to descending through the grammar hierarchy — not the structure of the resulting Abstract Syntax Tree (AST). So:

- **Multiplication** has **higher precedence**, meaning it’s parsed _deeper_ in the grammar.
- **Addition** has **lower precedence**, so it’s parsed _earlier_ — higher up in the grammar.

But in the **AST**, the opposite happens:

- The **higher-precedence operations** like `*` and `/` end up **closer to the leaves**, because they’re nested inside lower-precedence expressions.
- The **lower-precedence operations** like `+` and `-` are **closer to the root**, because they combine the results of deeper subexpressions.

### 🧠 Think of It Like This

Imagine parsing `1 + 2 * 3`:

- The parser starts at `expression → term → factor → primary`
- It sees `1`, then `+`, then `2 * 3`
- Because `*` binds tighter, the parser dives deeper to parse `2 * 3` first
- Then it wraps that result in the `+` operation

So the AST looks like:

```
     (+)
    /   \
 (1)   (*)
       / \
     (2) (3)
```

Here, `*` is deeper in the tree — even though it was parsed “later” in the grammar.

---

```bnf
expression     → equality ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary
               | primary ;
primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" ;
```

One of the most common top-down parsers is a _recursive descent parser_. Each grammar rule becomes a function, and those functions call each other recursively to parse substructures.

For example, if your grammar has:
```
expression → term (("+" | "-") term)*
term → factor (("*" | "/") factor)*
factor → NUMBER | "(" expression ")"
```

Then your parser might start with `parseExpression()`, which calls `parseTerm()`, which calls `parseFactor()`, and so on — descending through the grammar tree.

## How to convert grammar to code?

A recursive descent parser is a literal translation of the grammar’s rules straight into imperative code. Each rule becomes a function. The body of the rule translates to code roughly like:

|Grammar notation|Code representation|
|---|---|
|Terminal|Code to match and consume a token|
|Nonterminal|Call to that rule’s function|
|`\|`|`if` or `switch` statement|
|`*` or `+`|`while` or `for` loop|
|`?`|`if` statement|

The descent is described as “recursive” because when a grammar rule refers to itself—directly or indirectly—that translates to a recursive function call.

## [Challenges](https://craftinginterpreters.com/parsing-expressions.html#challenges)

1. In C, a block is a statement form that allows you to pack a series of statements where a single one is expected. The [comma operator](https://en.wikipedia.org/wiki/Comma_operator) is an analogous syntax for expressions. A comma-separated series of expressions can be given where a single expression is expected (except inside a function call’s argument list). At runtime, the comma operator evaluates the left operand and discards the result. Then it evaluates and returns the right operand.
    
    Add support for comma expressions. Give them the same precedence and associativity as in C. Write the grammar, and then implement the necessary parsing code.
    
1. Likewise, add support for the C-style conditional or “ternary” operator `?:`. What precedence level is allowed between the `?` and `:`? Is the whole operator left-associative or right-associative?


| Name        | Operators         | Associates |
| ----------- | ----------------- | ---------- |
| Comma       | ,                 | Left       |
| Conditional | ? :               | Left       |
| Equality    | `==` `!=`         | Left       |
| Comparison  | `>` `>=` `<` `<=` | Left       |
| Term        | `-` `+`           | Left       |
| Factor      | `/` `*`           | Left       |
| Unary       | `!` `-`           | Right      |

```bnf
expression     → comma ;
comma          → select ( "," select )*;
conditional    → equality ( "?" expression ":" conditional )? ;
equality       → comparison ( ( "!=" | "==" ) comparison )* ;
comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
term           → factor ( ( "-" | "+" ) factor )* ;
factor         → unary ( ( "/" | "*" ) unary )* ;
unary          → ( "!" | "-" ) unary
               | primary ;
primary        → NUMBER | STRING | "true" | "false" | "nil"
               | "(" expression ")" ;
```

Conditional needs right-associative and should be recursive a right?

- `match(QUESTION)` checks for `?` and advances if present.
- `thenBranch` is parsed with `expression()`, which includes comma.
- After consuming `:`, you call `conditional()` again to nest on the right side.
    
2. Add error productions to handle each binary operator appearing without a left-hand operand. In other words, detect a binary operator appearing at the beginning of an expression. Report that as an error, but also parse and discard a right-hand operand with the appropriate precedence.


Repeat the same idea for each binary-operator level:

1. **At method start**, check `if (match(OP_TOKENS…))`, e.g.
    
    - In `equality()`, look for `==` or `!=`
    - In `comparison()`, look for `<`, `<=`, etc.
    - In `term()`, look for `+` or `-`
    - In `factor()`, look for `*` or `/`
2. If it fires:
    
    - `error(previous(), "Missing left-hand operand before '" + previous().lexeme + "'");`
    - Parse and discard the right operand by calling the **same** operand parser for that level.
    - Return the right operand (so parsing can continue in a valid state).

Example for `term()`:

```java
private Expr term() {
  // Error prod: '+' or '-' at start
  if (match(PLUS, MINUS)) {
    Token op = previous();
    error(op, "Missing left-hand operand before '" + op.lexeme + "'");
    // recover by parsing one factor
    return factor();
  }

  Expr expr = factor();
  while (match(MINUS, PLUS)) {
    Token operator = previous();
    Expr right = factor();
    expr = new Expr.Binary(expr, operator, right);
  }
  return expr;
}
```

Repeat that guard-and-recover in each binary level.

---

## 4. Testing It

- Comma operator:
    
    ```lox
    1, 2, 3            // parses as ((1,2),3), evaluates to 3
    ```
    
- Ternary operator:
    
    ```lox
    a > b ? x : y      // a > b ? x : y
    a?b:c?d:e          // a ? b : (c ? d : e)
    ```
    
- Operator-at-start error:
    
    ```lox
    * 42               // “Missing left-hand operand before '*'” and then treats 42 as the whole expression
    ```
    

With these changes in place, your parser will correctly handle comma expressions, the `?:` operator, and will gracefully report—and recover from—any time a user types a binary operator with no left operand.