## Challenges

The lexical grammars of Python and Haskell are not regular. What does that mean, and why aren’t they?


### 🧠 What Does “Not Regular” Mean?

In programming language design, a **regular language** is one whose structure can be described using **regular expressions** and recognized by a **finite-state machine** (FSM). These are simple machines that don’t have memory—just a fixed set of states and transitions.

So when we say a language’s **lexical grammar is not regular**, it means:
- You **can’t fully describe its token rules using regular expressions alone**.
- You’d need something more powerful than a finite-state machine—like a **parser with memory** (e.g., a pushdown automaton).

---

### 🐍 Why Python’s Lexical Grammar Isn’t Regular

Python uses **indentation** to define blocks (like loops, functions, etc.). That means:
- The **amount of leading whitespace** matters.
- You need to **track indentation levels** to know when a block starts or ends.

This requires **memory**—you can’t just look at one line at a time and decide what it means. A finite-state machine can’t handle that, so Python’s grammar goes beyond regular.

Example:
```python
def greet():
    print("Hello")  # This line is inside the function
print("Bye")        # This line is outside
```
The difference is **indentation**, not keywords or punctuation.

---

### 🧮 Why Haskell’s Lexical Grammar Isn’t Regular

Haskell also uses **layout rules** (indentation) to infer where blocks begin and end. But it goes further:
- It inserts **virtual tokens** like `{`, `}`, and `;` based on indentation.
- This requires **context-sensitive logic** during scanning.

So again, you need **state and memory** to figure out where blocks start and stop.

---

### 🧪 Contrast: Regular Lexical Grammars

Languages like C, Java, or even Lox (from *Crafting Interpreters*) have regular lexical grammars:
- Tokens are separated by whitespace or punctuation.
- Block structure is defined by `{}` or keywords—not indentation.
- You can scan them with regexes and FSMs.

---

Aside from separating tokens—distinguishing print foo from printfoo—spaces aren’t used for much in most languages. However, in a couple of dark corners, a space does affect how code is parsed in CoffeeScript, Ruby, and the C preprocessor. Where and what effect does it have in each of those languages?

You're absolutely right—spaces usually just separate tokens in most languages. But in a few quirky corners of CoffeeScript, Ruby, and the C preprocessor, a space can actually **change how code is parsed**. Here's how:

---

### ☕ CoffeeScript: Space Affects Function Call Parsing

In CoffeeScript, **parentheses are optional** for function calls. That sounds nice—until whitespace gets involved.

#### Example:
```coffeescript
nums = [1..10].map (i) -> i * 2  # ✅ Works
nums = [1..10].map(i) -> i * 2  # ❌ Broken
```

#### Why?
- In the first case, the space tells CoffeeScript: “`map` is being called with a function.”
- In the second case, without the space, CoffeeScript thinks: “`map(i)` returns a function, which is then called with `-> i * 2`”—which makes no sense.

So the presence or absence of a **space between the method name and the argument list** changes the parse tree.

---

### 💎 Ruby: Space Can Affect Method Chaining

Ruby is usually whitespace-insensitive, but there are edge cases where it matters—especially with **method chaining and blocks**.

#### Example:
```ruby
puts 'hello world!' .gsub('hello', 'hi')  # ✅ Works
```

Even with excessive space before `.gsub`, Ruby still parses it correctly. But in more complex cases:

```ruby
[1, 2].each do |x| puts x end  # ✅ Works
[1, 2].eachdo |x| puts x end   # ❌ Syntax error
```

Here, the space between `each` and `do` is **required** to distinguish the method name from the block keyword.

Ruby’s parser uses whitespace to **disambiguate keywords from identifiers**, especially in DSL-like constructs.

---

### 🧩 C Preprocessor: Space Affects Macro Expansion

In the C preprocessor, spaces can affect how macros are expanded—especially with **stringification (`#`)** and **token pasting (`##`)**.

#### Example:
```c
#define STR(x) #x
STR(hello world)  // becomes "hello world"
```

- **Whitespace between tokens** inside macro arguments becomes **a single space** in the stringified result.
- If you use `##` to paste tokens, **extra spaces can break the token** or prevent proper concatenation.

#### Quirk:
```c
#define A(x) (10 + x + Y)
A(A(40))  // might insert space after 40 to avoid token collision
```

Compilers like GCC may **insert spaces during macro expansion** to avoid accidental merging of tokens (e.g., `40+20` becoming `4020`).

---

### 🧠 Summary Table

| Language       | Space Sensitivity | Where It Matters                          | Effect                                |
|----------------|-------------------|-------------------------------------------|----------------------------------------|
| CoffeeScript   | ✅ Yes             | Between method and argument list          | Changes function call parsing          |
| Ruby           | ✅ Sometimes       | Between method and block keywords         | Affects block recognition              |
| C Preprocessor | ✅ Yes             | In macro arguments and expansions         | Affects stringification and token glue |

---

Our scanner here, like most, discards comments and whitespace since those aren’t needed by the parser. Why might you want to write a scanner that does not discard those? What would it be useful for?


### 🧠 Why Most Scanners Discard Them

In traditional compilers or interpreters:
- **Whitespace** is usually just a separator between tokens.
- **Comments** are ignored—they don’t affect program behavior.

So scanners toss them out to simplify parsing.

---

### 🔍 When Keeping Them Is Useful

Here are some scenarios where **preserving whitespace and comments** is actually valuable:

#### 1. **Pretty-Printers / Code Formatters**
- Tools like `prettier`, `clang-format`, or `black` need to **reconstruct the original code layout**.
- Keeping comments ensures they’re **preserved and repositioned** correctly.
- Whitespace helps maintain **indentation and spacing style**.

#### 2. **Syntax Highlighting / IDEs**
- Editors like VSCode or IntelliJ need to **display comments and whitespace**.
- They use scanners that retain everything to **colorize and structure code** visually.

#### 3. **Documentation Generators**
- Tools like JSDoc, Sphinx, or Doxygen extract **comments as documentation**.
- These scanners treat comments as **first-class citizens**.

#### 4. **Linting and Style Analysis**
- Linters like ESLint or RuboCop may flag:
  - Missing or malformed comments
  - Inconsistent spacing or indentation
- So they need **full lexical fidelity**, including whitespace.

#### 5. **Macro Systems / Preprocessors**
- In languages like C or Rust, comments and spacing can affect **macro expansion**.
- A scanner that discards them might break macro logic or formatting.

#### 6. **HTML and Markdown Parsing**
- In HTML, whitespace between tags can affect rendering.
- In Markdown, spacing defines structure (e.g., code blocks, lists).
- So scanners must **preserve layout** to parse correctly.

---

### 🧩 Summary Table

| Use Case                  | Needs Comments? | Needs Whitespace? | Why? |
|---------------------------|------------------|--------------------|------|
| Code Formatter            | ✅ Yes           | ✅ Yes             | Reconstruct layout and style |
| Syntax Highlighter        | ✅ Yes           | ✅ Yes             | Visual structure and coloring |
| Documentation Generator   | ✅ Yes           | ❌ Optional        | Extract inline docs |
| Linter / Style Checker    | ✅ Yes           | ✅ Yes             | Enforce formatting rules |
| Macro System              | ✅ Sometimes     | ✅ Sometimes       | Preserve token structure |
| HTML/Markdown Parser      | ❌ No            | ✅ Yes             | Layout affects semantics |

---



Add support to Lox’s scanner for C-style /* ... */ block comments. Make sure to handle newlines in them. Consider allowing them to nest. Is adding support for nesting more work than you expected? Why?

It is OK, I only need to count the left and right hand side of the command and return when it become 0.