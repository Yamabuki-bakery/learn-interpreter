Lox is a class language, but not prototype language.

好的，咱們可以從歷史淵源、語言設計哲學，再到 C++ 與 JavaScript 的實際機制來層層剖開，幫你徹底把 prototype 語言與 class 語言的差異釐清。

---

## 🧬 1. Prototype 語言 vs Class 語言 — 核心定義與歷史背景

|語言模型|核心思想|代表語言|歷史源流|
|---|---|---|---|
|**Class-based（類導向）**|對象必須從「類」(class) 定義出來；類是抽象藍圖，實例是具體對象。|Simula (1967)、Smalltalk (1972)、C++ (1983)、Java (1995)|Simula 首創 "class" 與 "object" 概念；Smalltalk 將 OOP 推向極致；C++ 把 class 與靜態型別、編譯期檢查結合起來。|
|**Prototype-based（原型導向）**|沒有類的概念，直接由「現有物件」複製(clone) 或擴充成新物件；行為共享透過鏈接（prototype chain）。|Self (1986)、JavaScript (1995)、Lua（某種程度上）|Self 誕生於 Xerox PARC，追求極簡一致的 OOP；Brendan Eich 借鑒 Self 與 Scheme，把 prototype 模型引入 JavaScript。|

**簡單比喻**：

- Class 語言像建築藍圖：先畫藍圖（class），再蓋房子（instance）。
- Prototype 語言像黏土雕塑：現有一個雕塑（object），你直接在它基礎上雕新作品；共享部分靠一條「血脈鏈」（prototype chain）。

---

## 🛠 2. Prototype 與 Class 在內部運作的本質差別

### Class-based

- **類定義**：在編譯期確定屬性與方法佈局。
- **實例化**：new Class() → 根據類的結構在內存中分配空間。
- **方法查找**：通常透過 vtable（虛函數表）等固定結構。
- **型別檢查**：靜態型別（如 C++）在編譯時就能檢測錯誤。

### Prototype-based

- **沒有類藍圖**：對象本身就是原型。
- **原型鏈**：查找屬性時，先看實例自身，找不到就順著 `__proto__`（或內部的 `[[Prototype]]`）一路往上找，直到 `null`。
- **動態擴充**：任何物件在執行期都可以新增/刪除屬性，影響該原型鏈下的所有對象。

---

## ⚔️ 3. C++ 的 `class` vs JavaScript 的 `class`（表面相似，本質不同）

|特性|C++ class|JavaScript class（ES6）|
|---|---|---|
|本質|編譯期類型藍圖，生成固定內存結構與 vtable|語法糖（syntactic sugar），背後仍是原型鏈|
|方法儲存|編譯期決定、存於類型的函數表中|實際掛在 `ClassName.prototype` 上|
|繼承模型|靜態類繼承（單繼承 + 多重繼承 via virtual）|動態原型鏈繼承|
|型別檢查|編譯期|執行期（動態型別）|
|成員變數初始化|編譯期固定內存布局|每次 `new` 都在新物件上動態分配|
|多型（polymorphism）|靠虛函數與 vtable|靠原型鏈與動態綁定 `this`|

**關鍵點**  
JS 的 `class` 只是把 prototype 語法包裝成類似 C++/Java 的寫法，讓 OOP 背景的人更容易上手。例如：

```js
class Person {
  constructor(name) { this.name = name; }
  greet() { console.log(`Hi, I'm ${this.name}`); }
}
```

背後等價於：

```js
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};
```

所以你用 `class` 關鍵字寫的 JS 代碼，仍然是 prototype-based 的查找邏輯與內存結構。

---

## 📜 4. 為什麼 JS class 容易讓人困惑

1. **語法與語義錯位**：看起來像 C++/Java，但行為更接近 Self/Lua。
2. **動態 this 綁定**：不像 C++ 的 this 穩定指向實例，在 JS 中 `this` 決定於調用位置。
3. **可以隨時改原型**：即使 class 定義完成，仍能對其 prototype 動態添加方法。
4. **屬性/方法查找延後到執行期**：很多錯誤要到跑起來才會爆。

---

## 💡 5. 如何徹底理解 JS 的 class 與 prototype

- **從 prototype 出發**：試著不用 `class` 關鍵字，手動用 `Object.create()`、`Function.prototype` 來構建繼承。
- **畫原型鏈圖**：對每個物件畫出 `__proto__` 指向什麼，會讓查找機制直觀。
- **觀察 constructor 與 prototype 的關係**：
    
    ```js
    console.log(Person.prototype.constructor === Person); // true
    ```
    
- **實驗動態擴充**：
    
    ```js
    Person.prototype.sayBye = function() { console.log('Bye'); };
    new Person('Song').sayBye(); // 立即生效
    ```
    

---

這兩種寫法的差異，本質上在於 **你是把屬性掛在「原型」(prototype) 上，還是掛在構造函數本身（constructor function object）上**。它們影響到**誰能用到這個方法**，以及**屬性查找時在哪個鏈條上能找到它**。

---

## 1️⃣ `Person.prototype.sayBye = xxx`

- **掛載位置**：放在 `Person` 的 **原型物件** 上。
- **適用對象**：所有由 `new Person(...)` 實例化出來的對象，都能透過原型鏈找到並使用 `sayBye`。
- **屬性查找流程**：  
    當 `someone.sayBye()` 被呼叫時：
    1. JS 先在 `someone` 自身找 `sayBye`
    2. 找不到 → 往 `someone.__proto__`（也就是 `Person.prototype`）找
    3. 找到了 → 執行
- **優勢**：方法只儲存在一個地方（`prototype` 上），所有實例共用，節省記憶體。
- **典型用途**：定義實例方法（instance methods）。

```js
function Person(name) {
  this.name = name;
}

Person.prototype.sayBye = function() {
  console.log(`${this.name} says bye`);
};

const a = new Person('Alice');
a.sayBye(); // "Alice says bye"
```

---

## 2️⃣ `Person.sayBye = xxx`

- **掛載位置**：放在 `Person` 這個**函數物件本身**上，作為它的**靜態屬性/方法**。
- **適用對象**：只能透過 `Person.sayBye()` 直接呼叫，**實例不能用**（除非手動賦值給 prototype）。
- **屬性查找流程**：  
    呼叫 `Person.sayBye()` → JS 直接在 `Person` 這個函數物件上找屬性，不會去看 `Person.prototype`。
- **用途**：通常用於定義與整體類別相關的工具方法，而非單個實例行為（類似 C++/Java 的 static method）。

```js
function Person(name) {
  this.name = name;
}

Person.sayBye = function() {
  console.log('Everyone says bye');
};

Person.sayBye(); // OK
const b = new Person('Bob');
b.sayBye(); // ❌ TypeError: b.sayBye is not a function
```

---

## 🧠 記憶口訣

- **prototype → 實例共用方法**
- **constructor 本身 → 靜態方法**

可以想成：

- `prototype` 是「產品的模具」→ 每個產品（實例）都能使用。
- 函數物件自身的屬性是「工廠的工具」→ 只有工廠（類）自己能用。



## Challenges

1. Write some sample Lox programs and run them (you can use the implementations of Lox in [my repository](https://github.com/munificent/craftinginterpreters)). Try to come up with edge case behavior I didn’t specify here. Does it do what you expect? Why or why not?



2. This informal introduction leaves a _lot_ unspecified. List several open questions you have about the language’s syntax and semantics. What do you think the answers should be?

	How about arrays? How about dicts?

3. Lox is a pretty tiny language. What features do you think it is missing that would make it annoying to use for real programs? (Aside from the standard library, of course.)


	Interact with other languages? Or import/include feature for modules?
