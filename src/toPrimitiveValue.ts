import { isPrimitive } from './dataType'
import { Primitive } from './typings/constants'

// const inArrayCache = new WeakMap()
// export function toPrimitiveValue(value: any): Primitive {
//   if (isPrimitive(value)) return value
//   if (inArrayCache.has(value)) return inArrayCache.get(value)
//   const changed = (() => {
//     const items = Object.entries(value)
//       .flat()
//       .map((value) => (isPrimitive(value) ? value : toPrimitiveValue(value)))
//     const mergedString = '$#' + items.join('$#')
//     return mergedString
//   })()
//   inArrayCache.set(value, changed)
//   return changed
// }
export function toPrimitiveValue(value: any): Primitive {
  if (isPrimitive(value)) return value
  return JSON.stringify(value)
}
