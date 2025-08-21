
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