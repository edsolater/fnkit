import { MayDeepReadonlyArray } from '../typings/tools'
import flatMayArray from '../array/flatMayArray'
import isArray from '../judgers/isArray'
import _mergeObjects from '../_mergeObjects'
import parallelSwitch from '../magic/parallelSwitch'
import isObject from '../judgers/isObject'

/**
 * 合并多个对象
 * (如果是数组，则合并)
 * @param objs 嵌套数组的对象
 * @example
 * mergeDeep({a:3, b:2}, {a:1}) // {a:1, b:2}
 * mergeDeep({a:3, b:2}, undefined, {a:1}) // {a:1, b:2}
 * mergeDeep({a:3, b:2, c:{a:2}}, {a:1, c:{b:3}}) // {a:1, b:2, c:{a:2, b:3}}
 * mergeDeep({a:3, b:2, c:{a:2}}, {a:1, c:{b:3}}, false) // {a:1, b:2, c:{a:2, b:3}}
 * mergeDeep({a:3, b:2, c:{a:2}}, {a:1, c:{b:3}}, {c:false}) // {a:1, b:2, c:false}
 * mergeDeep({a:3, b:2, c:{a:2}}, [{a:1, c:{b:3}}, {c:false}]) // {a:1, b:2, c:false}
 * mergeDeep({a:3, b:2, c:[2]}, {a:1, c:[3]}, {c:[4,5]}) // {a:1, b:2, c:[2,3,4,5]}
 */
export default function mergeDeep<T>(...objs: T[]): T {
  const mergeRule = (key, v1, v2) =>
    parallelSwitch<string, any>(
      key,
      [
        [() => isObject(v1) && isObject(v2), () => _mergeObjects([v1, v2], mergeRule)],
        [() => isArray(v1) && isArray(v2), () => v1.concat(v2)]
      ],
      v2 ?? v1
    )
  return _mergeObjects(flatMayArray(objs).filter(Boolean), mergeRule)
}
