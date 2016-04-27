# The Super Tiny _Interpreter_
[![build status](https://img.shields.io/travis/keyanzhang/the-super-tiny-interpreter/master.svg?style=flat-square)](https://travis-ci.org/keyanzhang/the-super-tiny-interpreter)
[![test coverage](https://img.shields.io/coveralls/keyanzhang/the-super-tiny-interpreter/master.svg?style=flat-square)](https://coveralls.io/github/keyanzhang/the-super-tiny-interpreter?branch=master)

Let's explain what a **[closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)** is by writing a JavaScript interpreter in JavaScript.

This project is still a **work in progress**, but feel free to poke around and check out the unit tests.

## Disclaimer
The goal of this project is **not** to make a spec-compliant or blazing-fast interpreter. The goal, however, is to interpret a tiny subset of JavaScript features in **super-easy-to-read™** code.

## Supported Syntax
1. Numbers, Booleans, `null`, and `undefined`

  ```javascript
  12 // Numeric Literal
  true // Boolean Literal
  null // Null Literal
  undefined // Do you know that `undefined` is actually an identifier? Paul Irish calls shadowing it the "Asshole Effect".
  ```

2. Variable, a.k.a. Identifier

  ```javascript
  foo
  ```

3. Binary Operators

  ```javascript
  +, -, *, /, ==, ===, !=, !==, <, <=, >, >=
  ```

4. Unary Operators

  ```javascript
  !, -
  ```

5. Conditional Expression, a.k.a. the ternary operator

  ```javascript
  test ? consequent : alternate
  ```

6. Arrow Function Expression
  - Notice that we didn't implement the traditional `function` syntax. Arrow functions FTW!

  ```javascript
  (x) => x + 1

  (x) => {
    const y = x + 100;
    return y * y;
  }
  ```

7. Call Expression

  ```javascript
  foo(1, 2, 3)
  ```

8. Variable Declaration Statement
  - Notice that we only support `const` for now and there's NO mutation (assignment) in our language.
    - That means we can initialize stuff once and only once
    - And of course `const foo` is not valid JavaScript
  - If you are familiar with Scheme/OCaml, then `const LHS = RHS` behaves just like a `letrec`.

  ```javascript
  const foo = 12;

  const fact = (x) => x < 2 ? 1 : x * fact(x - 1);
  ```
