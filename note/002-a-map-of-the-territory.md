學習路徑

## 語言的構成

Eventually we reach the peak. We have a bird’s-eye view of the user’s program and can see what their code _means_. We begin our descent down the other side of the mountain. We transform this highest-level representation down to successively lower-level forms to get closer and closer to something we know how to make the CPU actually execute.

![[file-20250812194106249.jpg]]
## Scanning

將文本轉換爲 token

![[file-20250812194730212.jpg]]

## Parse

將 token 串轉換爲 AST，檢查語法的錯誤

![[file-20250812194940342.jpg]]


## Static analysis

從這裏開始是各大編程語言會走向不同的方向。

做的事情有：
 1. resolution 符號定義
 2. 檢查作用域
 3. type check

把剛纔得到的那些信息保存在某個地方，可以是 AST，symbol table 或者 IR

剛纔的這些步驟是語言實現的「前端」

## 中級描述 IR

In the middle, the code may be stored in some **intermediate representation** (**IR**) that isn’t tightly tied to either the source or destination forms (hence “intermediate”). Instead, the IR acts as an interface between these two languages.

If you’ve ever wondered how [GCC](https://en.wikipedia.org/wiki/GNU_Compiler_Collection) supports so many crazy languages and architectures, like Modula-3 on Motorola 68k, now you know. Language front ends target one of a handful of IRs, mainly [GIMPLE](https://gcc.gnu.org/onlinedocs/gccint/GIMPLE.html) and [RTL](https://gcc.gnu.org/onlinedocs/gccint/RTL.html). Target back ends like the one for 68k then take those IRs and produce native code.

## Optimization

 - constant folding
 - 等

但是很多語言並不追求編譯時的極致優化，而是加快運行時的速度，比如 Lua 和 CPython

## 代碼生成

對於某個特定平臺生成能夠運行的代碼，這就是「後端」的工作

生成 bytecode 來貼近語言特性，但是不被平臺束縛

## VM

運行 bytecode

## Runtime

All of this stuff is going at runtime, so it’s called, appropriately, the **runtime**. In a fully compiled language, the code implementing the runtime gets inserted directly into the resulting executable. In, say, [Go](https://golang.org/), each compiled application has its own copy of Go’s runtime directly embedded in it. If the language is run inside an interpreter or VM, then the runtime lives there. This is how most implementations of languages like Java, Python, and JavaScript work.

## 某些語言的特殊情況

### Single-pass compiler

一些简单的编译器将解析、分析和代码生成交织在一起，这样它们就可以直接在解析器中生成输出代码，而无需分配任何语法树或其他IR。这些单遍编译器限制了语言的设计。你没有中间数据结构来存储程序的全局信息，也不会重新访问任何之前解析过的代码部分。 这意味着，一旦你看到某个表达式，就需要足够的知识来正确地对其进行编译。

Pascal和C语言就是围绕这个限制而设计的。在当时，内存非常珍贵，一个编译器可能连整个源文件都无法存放在内存中，更不用说整个程序了。这也是为什么Pascal的语法要求类型声明要先出现在一个块中。这也是为什么在C语言中，你不能在定义函数的代码上面调用函数，除非你有一个明确的前向声明，告诉编译器它需要知道什么，以便生成调用后面函数的代码。

### [Tree-walk interpreters](https://craftinginterpreters.com/a-map-of-the-territory.html#tree-walk-interpreters)

一些小語言直接拿 AST 來執行，直接屌差各個節點上的表達式


## 轉譯器

把妳的源代碼編譯成另外一種語言的源代碼，這樣就可以盜竊牠們的編譯器和流水線了

## JIT

牛逼的 JIT 會插入跑分 hook 到實際的代碼中來查出 hot spot，之後就會用更激進的優化來重新編譯。


## 編譯器和解釋器？

![[file-20250812205836172.jpg]]



![[file-20250812205917523.jpg]]


## Challenges

1. Pick an open source implementation of a language you like. Download the source code and poke around in it. Try to find the code that implements the scanner and parser. Are they handwritten, or generated using tools like Lex and Yacc? (`.l` or `.y` files usually imply the latter.)

	我看了一眼 CPython 的，牠的相關代碼都在 Parser 文件夾下面。看起來是手撕的，查看 lexer.c 發現，裏面似乎有檢查字符的代碼，比如說 # 開頭的是註釋
    
2. Just-in-time compilation tends to be the fastest way to implement dynamically typed languages, but not all of them use it. What reasons are there to _not_ JIT?

	Python 長期不支持 JIT（Just-In-Time）編譯，背後其實有一連串深思熟慮的技術與文化考量。直到最近 Python 3.13 才引入了實驗性的 JIT 支援。以下是幾個主要原因：

---

### 🧠 CPython 的設計哲學

- **簡潔與可預測性優先**：CPython（Python 的主實作）一直強調可讀性與一致性。JIT 編譯雖然能提升效能，但也可能引入非預期的行為或難以追蹤的錯誤。
- **動態特性難以優化**：Python 是高度動態的語言，支援 monkey patching、動態類型、反射等特性，這些都讓 JIT 編譯器難以做出有效的靜態分析與優化。

---

### 🧱 技術挑戰與歷史背景

- **已有 bytecode 解釋器**：Python 傳統上是將原始碼編譯成 bytecode，再由解釋器執行。這種架構簡單、穩定，且易於除錯與擴展。
- **早期替代方案已存在**：
    - **PyPy**：這是 Python 的另一個實作，早就內建 JIT 編譯器，效能遠超 CPython。但它與 CPython 不完全相容，導致生態系分裂。
    - **Numba、Cython**：這些工具提供了針對特定場景的 JIT 或 AOT 編譯能力，彌補了 CPython 的效能不足。

---

### 🧪 為何現在才加入 JIT？

- **PEP 744 的出現**：2024 年，PEP 744 提出了將 JIT 編譯納入 CPython 的計畫，並在 Python 3.13 中以實驗性功能實現。
- **新架構支持**：Python 3.11 開始引入「adaptive interpreter」，能根據執行時資訊優化 bytecode。這為 JIT 奠定了基礎。
- **效能壓力與社群需求**：隨著 Python 在科學計算、機器學習、Web 開發等領域的廣泛應用，效能瓶頸成為越來越迫切的問題。

---

### 🐢 為何進展仍然緩慢？

- **JIT 效能仍不穩定**：根據核心開發者 Ken Jin 的說法，Python 3.13 的 JIT 在許多情況下甚至比解釋器慢。
- **人力資源有限**：JIT 的開發主要由社群驅動，早期甚至只有一人主導。微軟原本支持的 Faster CPython 專案也在 2025 年中止。
- **多層解釋器架構複雜**：Python 3.13 引入了 Tier 1 和 Tier 2 解釋器與 IR（Intermediate Representation），使得效能比較變得混亂。

---

如果你對 JIT 的技術細節或 CPython 的演進有興趣，我可以幫你整理 PEP 744 的核心設計理念，或比較 PyPy 與 CPython 的 JIT 策略。你想深入哪一塊？


### 🧵 Ruby（特別是 MRI）

- **實作：** MRI（Matz’s Ruby Interpreter）是 Ruby 的主流實作，直到 Ruby 2.6 才引入 MJIT（Method-based JIT）。
    
- **原因：**
    - Ruby 的動態性比 Python 更強，例如 `method_missing`、`eval`、`define_method` 等特性讓靜態分析變得困難。
    - Ruby 社群長期重視開發者體驗與語言表達力，效能並非首要目標。
    - JIT 對於 Web 應用（如 Rails）效能提升有限，反而增加複雜度。
        

### 🧶 PHP（Zend Engine）

- **實作：** 傳統 PHP 是純解釋執行，直到 PHP 7 引入 OPcache，PHP 8 才開始探索 JIT。
- **原因：**
    - PHP 的典型使用場景是短生命周期的 Web 請求，JIT 的啟動成本不一定划算。
    - PHP 的執行模型偏向「快啟快結」，不像長時間運行的伺服器程式那樣能從 JIT 中獲益。
    - Zend Engine 的架構原本就不易整合 JIT。
        

### 🧮 Lua（特別是標準 Lua）

- **實作：** 標準 Lua 沒有 JIT，但 LuaJIT 是一個高效能的替代實作。
- **原因：**
    - 標準 Lua 強調可移植性與簡潔性，JIT 編譯器會增加平台依賴與維護成本。
    - Lua 常用於嵌入式系統與遊戲腳本，這些場景對記憶體與啟動時間非常敏感。
    
3. Most Lisp implementations that compile to C also contain an interpreter that lets them execute Lisp code on the fly as well. Why?

	Great question! Most Lisp implementations that compile to C (or native code) also include an interpreter, and this duality isn’t just legacy—it’s deeply tied to Lisp’s philosophy and technical needs. Here's why:

---

### 🧠 1. **Lisp's Homoiconicity and `eval`**

- Lisp treats code as data—its syntax is just nested lists.
- This allows powerful metaprogramming: you can generate and execute code at runtime using `eval`.
- To support `eval`, you need an interpreter available at runtime—even if the rest of the program is compiled.

> 🧩 Example: `(eval '(+ 1 2))` requires the system to parse and execute code dynamically.

---

### 🛠 2. **Macro Expansion and Compile-Time Evaluation**

- Lisp macros are not just syntactic sugar—they're full-blown code transformers.
- During compilation, macros often execute arbitrary Lisp code to generate new forms.
- This means the compiler itself must be able to interpret Lisp code during compilation.

> 📦 Many Lisp compilers are _self-hosted_, written in Lisp, and rely on the interpreter to bootstrap macro expansion.

---

### 🔄 3. **Mixed Execution Model**

- Lisp systems often allow **interleaved interpreted and compiled code**.
- You can compile performance-critical parts and interpret others for flexibility or debugging.
- This is especially useful in REPL-driven development, where rapid iteration is key.

> 🧪 In Common Lisp, you can use `COMPILE` or `COMPILE-FILE` to compile functions, but still run interpreted code in the same session.

---

### 🧬 4. **Dynamic Typing and Runtime Decisions**

- Lisp is dynamically typed, and many optimizations depend on runtime type information.
- An interpreter can help gather profiling data or serve as a fallback when types are ambiguous.
- Some systems even use the interpreter as a fallback when compilation fails or isn’t worthwhile.

---

### 🧭 Summary Table

|Reason|Explanation|
|---|---|
|`eval` and runtime code execution|Lisp needs to run code dynamically, even during compilation.|
|Macro system|Macros execute Lisp code at compile time, requiring an interpreter.|
|REPL and interactive dev|Interpreters support rapid prototyping and debugging.|
|Mixed-mode execution|Compiled and interpreted code can coexist and call each other.|
|Bootstrapping and self-hosting|Many Lisp compilers are written in Lisp and need an interpreter to start.|

---

If you're curious, I can show how this model compares to languages like Scheme, Racket, or even JavaScript (which also mixes interpretation and JIT). Or we can dive into how Lisp systems manage incremental compilation and runtime environments. What direction would you like to explore next?