import { isJSON, isObject } from "./dataType"
import { ID } from "./typings/constants"

/**
 * 组合字符串们（n^3 复杂度）（不保证顺序）
 * @param template 模板字符串
 * @param stringsArray 替换模板用的字符串组合们
 * @example
 * composeStringArrays('%1: %2', ['hello', 'hi'], ['Bill', 'Simon']) // [
 *   'hello: Bill',
 *   'hi: Bill',
 *   'hello: Simon',
 *   'hi: Simon'
 * ]
 */
export function composeStringArrays(template: string, ...stringsArray: Array<string[]>) {
  let resultStrings: string[] = [template]
  let newStrings: string[] = []
  for (let i = 0; i < stringsArray.length; i++) {
    const stringsItem = stringsArray[i]
    for (let j = 0; j < stringsItem.length; j++) {
      const word = stringsItem[j]
      for (let m = 0; m < resultStrings.length; m++) {
        const original = resultStrings[m]
        newStrings.push(original.replace(`%${i + 1}`, word))
      }
    }
    resultStrings = newStrings
    newStrings = []
  }
  return resultStrings
}

/**
 * 深层次JSON.parse
 * @param jsonString 源
 * @example
 * const source1 = "{\"b\":true,\"a\":\"{\\\"a\\\":1}\"}"
 * console.log(deepJSONParse(source1)) // { b: true, a: { a: 1 } }
 * const source2 = "3"
 * console.log(deepJSONParse(source2)) // 3
 * const source3 = "{\"a\":1}"
 * console.log(deepJSONParse(source3)) // { a: 1 }
 * @todo 没有考虑数组的因素，还是不够健壮的
 */
export function deepJSONParse(jsonString: unknown) {
  const parsed = isJSON(jsonString) ? JSON.parse(jsonString) : jsonString
  if (Array.isArray(parsed)) {
    const result: any[] = []
    parsed.forEach((item) => {
      result.push(deepJSONParse(item))
    })
    return result
  } else if (isObject(parsed)) {
    const result = {}
    Object.entries(parsed).forEach(([key, value]) => {
      result[key] = deepJSONParse(value)
    })
    return result
  } else {
    return parsed
  }
}

/**
 * (纯函数)
 * 取字符串的第一个字符
 * @param str 目标字符串
 */
export function getFirstChar(str: string): string {
  return str[0] ?? ""
}

/**
 * (纯函数)
 * 取字符串的最后一个字符
 * @param str 目标字符串
 */
export function getLastChar(str: string): string {
  return str[str.length - 1] ?? ""
}

/**
 * 获取所有能匹配的所有子字符串
 * @param str 目标字符串
 * @param regex 正则
 * @returns 匹配到的字符串们
 * @example
 * getMatches('hello world', /\wo/) // ['lo', 'wo']
 */
export function getMatches(str: string, regex: RegExp): string[] {
  return Array.from(str.match(new RegExp(regex, "g")) ?? [])
}

/**
 * 随机
 * 产生一个5位数数字字符串的id
 */
export function randomCreateId(): ID {
  return String("aa" + Math.round(+Math.random().toFixed(4) * 10000))
}
