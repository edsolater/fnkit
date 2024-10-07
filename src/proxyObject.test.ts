import { expect, test, vi } from "vitest"
import { proxyObject } from "./proxyObject"

test("proxyObject - method invocation observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = proxyObject(obj)
  const barCallback = vi.fn()

  observableObj.onMethodInvoke("bar", barCallback)
  observableObj.bar()

  expect(barCallback).toHaveBeenCalled()
})

test("proxyObject - property access observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = proxyObject(obj)
  const fooAccessCallback = vi.fn()

  observableObj.onAccess("foo", fooAccessCallback)
  console.log(observableObj.foo)

  expect(fooAccessCallback).toHaveBeenCalledWith(1)
})

test("proxyObject - property set observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = proxyObject(obj)
  const fooSetCallback = vi.fn()

  observableObj.onSet(fooSetCallback)
  observableObj.foo = 2

  expect(fooSetCallback).toHaveBeenCalledWith("foo", 2, 1)
})

test("proxyObject - property delete observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = proxyObject(obj)
  const fooDeleteCallback = vi.fn()

  observableObj.onDelete(fooDeleteCallback)
  // @ts-ignore
  delete observableObj.foo

  expect(fooDeleteCallback).toHaveBeenCalledWith("foo")
})

test("proxyObject - property value observation", () => {
  const obj = {
    foo: 1,
    bar() {
      console.log("bar method invoked")
    },
  }

  const observableObj = proxyObject(obj)
  const fooValueCallback = vi.fn()

  observableObj.onValueChange("foo", fooValueCallback)
  observableObj.foo = 2

  expect(fooValueCallback).toHaveBeenCalledWith(2, 1)
})

// test("proxyObject - property value observation2", () => {
//   let invoked = false
//   const obj = {
//     foo: 1,
//     bar() {
//       obj.foo = 2
//     },
//   }

//   const observableObj = proxyObject(obj)
//   console.log('4: ', 4)
//   observableObj.onValueChange("foo", (value, prevValue) => {
//     invoked = true
//     console.log(3)
//   })
//   observableObj.onSet((property, value, prevValue) => {
//     console.log('property: ', property, value)
//   })
//   observableObj.bar()

//   expect(invoked).toBe(true)
// })
