import objectFilter from '../object/objectFilter'

/**
 * 合并多个对象（会返回新对象）(浅复制)
 */
function mergeObjects<T>(obj1: T): T
function mergeObjects<T, U>(obj1: T, obj2: U): T & U
function mergeObjects<T, U, V>(obj1: T, obj2: U, obj3: V): T & U & V
function mergeObjects<T, U, V, W>(obj1: T, obj2: U, obj3: V, obj4: W): T & U & V & W
function mergeObjects<T extends object>(...objs: T[]): T
function mergeObjects<T extends object>(...objs: T[]) {
  const result = Object.assign({}, ...objs)
  return objectFilter(result, ([, value]) => value !== undefined)
}
export default mergeObjects
