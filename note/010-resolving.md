
We are going to solve the "frozen closure problem"

```js
var a = "global";
{
  fun showA() {
    print a;
  }

  showA();
  var a = "block";
  showA();
}
```

Before the fix, the first call will show global, but the second one will show block, which means the var reference in 2 calls will resolve to different scope. However, we will expect it to print “global” twice.

![Cause](file-20250912000118637.jpg)
## Semantic Analysis

We know static scope means that a variable usage always resolves to the same declaration, which can be determined just by looking at the text. Given that, why are we doing it dynamically every time? Doing so doesn’t just open the hole that leads to our annoying bug, it’s also needlessly slow.

A better solution is to resolve each variable use _once_. Write a chunk of code that inspects the user’s program, finds every variable mentioned, and figures out which declaration each refers to. This process is an example of a **semantic analysis**. Where a parser tells only if a program is grammatically correct (a _syntactic_ analysis), semantic analysis goes farther and starts to figure out what pieces of the program actually mean. In this case, our analysis will resolve variable bindings. We’ll know not just that an expression _is_ a variable, but _which_ variable it is.

![](file-20250912000433399.jpg)

We hope the "a" will always be resolved to the second environment, no matter how the local block changes.

## A variable resolution pass

An additional resolution pass is added between parsing and interpreting.
The resolution result will be passed to the interpreter, and will be referenced at the runtime.


## Challenges

1. Why is it safe to eagerly define the variable bound to a function’s name when other variables must wait until after they are initialized before they can be used?
    
2. How do other languages you know handle local variables that refer to the same name in their initializer, like:
    
```js
    var a = "outer";
    {
      var a = a;
    }
```

    Is it a runtime error? Compile error? Allowed? Do they treat global variables differently? Do you agree with their choices? Justify your answer.
    
3. Extend the resolver to report an error if a local variable is never used.
    
4. Our resolver calculates _which_ environment the variable is found in, but it’s still looked up by name in that map. A more efficient environment representation would store local variables in an array and look them up by index.
    
    Extend the resolver to associate a unique index for each local variable declared in a scope. When resolving a variable access, look up both the scope the variable is in and its index and store that. In the interpreter, use that to quickly access a variable by its index instead of using a map.


## 🛠️ Practical Challenge 2: **Use an index instead of a name for local variable access**

### 🎯 Goal:

Speed up variable lookup by using an array and index instead of a map and name.

### 🔧 Implementation Steps:

1. **Assign index during resolution**:
    
    - In `Resolver`, assign each variable a unique index within its scope.
    - Store this index in a side table (e.g., `Map<Expr, Integer>`).
2. **Update `Environment`**:
    
    - Replace `Map<String, Object>` with `List<Object>` or array.
    - Use the index to get/set values.
3. **Interpreter changes**:
    
    - In `visitVariableExpr()` and `visitAssignExpr()`, use the index to access the variable.

### 🧩 Code Sketch:

```java
// In Environment.java
Object getAt(int distance, int index) {
    return ancestor(distance).values.get(index);
}

void assignAt(int distance, int index, Object value) {
    ancestor(distance).values.set(index, value);
}
```

This change makes variable access O(1) and avoids string lookups.

---

Would you like help implementing these changes in your own interpreter codebase? I can walk you through modifying the `Resolver`, `Interpreter`, and `Environment` classes step by step.