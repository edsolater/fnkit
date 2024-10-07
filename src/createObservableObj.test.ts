import { expect, test, vi } from "vitest"
import { createObservableObj } from "./createObservableObj"

test("createObservableObj - method invocation observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = createObservableObj(obj)
  const barCallback = vi.fn()

  observableObj.observeMethodInvoke("bar", barCallback)
  observableObj.bar()

  expect(barCallback).toHaveBeenCalled()
})

test("createObservableObj - property access observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = createObservableObj(obj)
  const fooAccessCallback = vi.fn()

  observableObj.observePropertyAccess("foo", fooAccessCallback)
  console.log(observableObj.foo)

  expect(fooAccessCallback).toHaveBeenCalledWith(1)
})

test("createObservableObj - property set observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = createObservableObj(obj)
  const fooSetCallback = vi.fn()

  observableObj.observePropertySet(fooSetCallback)
  observableObj.foo = 2

  expect(fooSetCallback).toHaveBeenCalledWith("foo", 2, 1)
})

test("createObservableObj - property delete observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = createObservableObj(obj)
  const fooDeleteCallback = vi.fn()

  observableObj.observePropertyDelete(fooDeleteCallback)
  // @ts-ignore
  delete observableObj.foo

  expect(fooDeleteCallback).toHaveBeenCalledWith("foo")
})
