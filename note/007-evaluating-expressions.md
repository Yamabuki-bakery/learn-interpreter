## [Challenges](https://craftinginterpreters.com/evaluating-expressions.html#challenges)

1. Allowing comparisons on types other than numbers could be useful. The operators might have a reasonable interpretation for strings. Even comparisons among mixed types, like `3 < "pancake"` could be handy to enable things like ordered collections of heterogeneous types. Or it could simply lead to bugs and confusion.
    
    Would you extend Lox to support comparing other types? If so, which pairs of types do you allow and how do you define their ordering? Justify your choices and compare them to other languages.


Great question — and one that gets to the heart of language design trade-offs between flexibility and clarity. Lox, as implemented in _Crafting Interpreters_, only allows comparisons (`<`, `>`, etc.) between numbers. But extending it to support more types can make the language more expressive, especially for heterogeneous collections or dynamic scripting.

Let’s break it down:

---

## 🔄 Types Worth Comparing

Here’s a reasonable set of type pairs to support, along with their ordering semantics:

|Type Pair|Ordering Definition|Justification|
|---|---|---|
|`number < number`|Standard numeric comparison|Already supported|
|`string < string`|Lexicographic (Unicode code point)|Common in JS, Python, Ruby|
|`boolean < boolean`|`false < true`|Useful for sorting, matches JS/Python|
|`nil < any`|`nil` is always less than any non-nil value|Helps with null-safe sorting|
|`any < nil`|Always false|Symmetric with above|
|`mixed types`|Disallowed or explicitly ordered by type name|Avoids confusion unless explicitly defined|

---

## 🧠 How to Define Mixed-Type Ordering

If you want to allow comparisons between mixed types (e.g., `3 < "apple"`), you need a total ordering. One approach is **type precedence**, like:

```ts
number < string < boolean < object < nil
```

This is how Python handles comparisons in older versions (before 3.x disallowed it). JavaScript, on the other hand, coerces types aggressively — `"3" < 5` becomes `3 < 5`, which can be surprising.

But this leads to **semantic ambiguity**. What does `"true" < false` mean? Is it a string vs boolean or a coercion? That’s why many languages (including modern Python and Ruby) disallow mixed-type comparisons unless explicitly cast.

---

## ✅ Recommended Extension for Lox

If you're extending Lox in TypeScript and want to keep it clean and predictable, I’d suggest:

1. **Allow comparisons for:**
    
    - Numbers
    - Strings
    - Booleans
    - `nil` vs any (with `nil` always less)
2. **Disallow mixed-type comparisons** unless you define a clear total ordering.
    
3. **Throw runtime errors** for unsupported comparisons, just like Lox does for invalid arithmetic.
    

---

## ✨ Bonus: Sorting Heterogeneous Arrays

If you want to support sorting arrays with mixed types, define a `compare(a, b)` function that:

- First compares types by a fixed precedence
- Then compares values within the same type

This gives you predictable behavior without surprising coercions.

---

Would you like help implementing this in your TypeScript interpreter? I can sketch out a `compareValues()` function that handles all these cases cleanly.

1. Many languages define `+` such that if _either_ operand is a string, the other is converted to a string and the results are then concatenated. For example, `"scone" + 4` would yield `scone4`. Extend the code in `visitBinaryExpr()` to support that.

\<solved>

3. What happens right now if you divide a number by zero? What do you think should happen? Justify your choice. How do other languages you know handle division by zero, and why do they make the choices they do?
    
    Change the implementation in `visitBinaryExpr()` to detect and report a runtime error for this case.

\<solved>