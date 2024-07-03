import { isObject } from "./dataType"

const isDate = (d) => d instanceof Date
const isEmpty = (o) => Object.keys(o).length === 0
//@ts-expect-error
const hasOwnProperty = (o: object, ...args: any[]) => Object.prototype.hasOwnProperty.call(o, ...args)
const isEmptyObject = (o) => isObject(o) && isEmpty(o)
const makeObjectWithoutPrototype = () => Object.create(null)

/**
 *
 * from npm package `deep-object-diff`
 * @example
 * const lhs = {
 *   foo: {
 *     bar: {
 *       a: ['a', 'b'],
 *       b: 2,
 *       c: ['x', 'y'],
 *       e: 100 // deleted
 *     }
 *   },
 *   buzz: 'world'
 * };
 *
 * const rhs = {
 *   foo: {
 *     bar: {
 *       a: ['a'], // index 1 ('b')  deleted
 *       b: 2, // unchanged
 *       c: ['x', 'y', 'z'], // 'z' added
 *       d: 'Hello, world!' // added
 *     }
 *   },
 *   buzz: 'fizz' // updated
 * };
 *
 * console.log(diff(lhs, rhs)); // =>
 * /*
 * {
 *   foo: {
 *     bar: {
 *       a: {
 *         '1': undefined
 *       },
 *       c: {
 *         '2': 'z'
 *       },
 *       d: 'Hello, world!',
 *       e: undefined
 *     }
 *   },
 *   buzz: 'fizz'
 * }
 */
export function objectDiff(lhs: object, rhs: object): object {
  if (lhs === rhs) return {} // equal return no diff

  if (!isObject(lhs) || !isObject(rhs)) return rhs // return updated rhs

  const deletedValues = Object.keys(lhs).reduce((acc, key) => {
    if (!hasOwnProperty(rhs, key)) {
      acc[key] = undefined
    }

    return acc
  }, makeObjectWithoutPrototype())

  if (isDate(lhs) || isDate(rhs)) {
    if (lhs.valueOf() == rhs.valueOf()) return {}
    return rhs
  }

  return Object.keys(rhs).reduce((acc, key) => {
    if (!hasOwnProperty(lhs, key)) {
      acc[key] = rhs[key] // return added r key
      return acc
    }

    const difference = objectDiff(lhs[key], rhs[key])

    // If the difference is empty, and the lhs is an empty object or the rhs is not an empty object
    if (isEmptyObject(difference) && !isDate(difference) && (isEmptyObject(lhs[key]) || !isEmptyObject(rhs[key])))
      return acc // return no diff

    acc[key] = difference // return updated key
    return acc
  }, deletedValues)
}
