import { isFunction, isMap, isRegExp, isString } from '../dataType'

/**
 * @todo test it
 * @description A map that can match string with RegExp or Function, simplize a bunch of 'if/switch'
 */
export class ConditionMap<K extends string | RegExp | ((item: string) => boolean), V> {
  private innerStringMap: Map<K & string, V>
  private innerRegExpMap: Map<K & RegExp, V>
  private innerFunctionRuleMap: Map<K & Function, V>

  constructor(map: Record<K & string, V>)
  constructor(map: Map<K & (string | RegExp | ((item: string) => boolean)), V>)
  constructor(map: Map<K, V> | Record<keyof any, V>) {
    const rules = isMap(map) ? map : (Object.entries(map) as Iterable<[K, V]>)

    // inner data store
    this.innerStringMap = new Map()
    this.innerRegExpMap = new Map()
    this.innerFunctionRuleMap = new Map()
    for (const [key, vlaue] of rules) {
      if (isString(key)) this.innerStringMap.set(key, vlaue)
      else if (isFunction(key)) this.innerFunctionRuleMap.set(key, vlaue)
      else if (isRegExp(key)) this.innerRegExpMap.set(key, vlaue)
    }
  }

  /**
   * access how much rules has defined
   */
  get ruleCount() {
    return this.innerStringMap.size + this.innerFunctionRuleMap.size + this.innerRegExpMap.size
  }

  /**
   *
   * @param needToMatch string to check
   * @returns predefined rule
   */
  match(needToMatch: string) {
    //@ts-expect-error not need to care type mismatch 'string'
    if (this.innerStringMap.has(needToMatch)) {
      //@ts-expect-error not need to care type mismatch 'string'
      return this.innerStringMap.get(needToMatch)
    } else {
      for (const [regexpRule, result] of this.innerRegExpMap) {
        if (regexpRule.test(needToMatch)) return result
      }
      for (const [functionRule, result] of this.innerFunctionRuleMap) {
        if (isFunction(functionRule) && functionRule(needToMatch)) return result
      }
    }
  }

  /**
   * only find in string rules
   */
  find(match: (item: K & string) => boolean) {
    for (const [key, value] of this.innerStringMap) {
      if (match(key)) return value
    }
  }
}

export function createConditionMap<K extends string, V>(map: Record<K, V>): ConditionMap<K, V>
export function createConditionMap<K extends string | RegExp | ((item: string) => boolean), V>(
  map: Iterable<readonly [K, V]>
): ConditionMap<K, V>
export function createConditionMap<K extends string, V>(map: Record<K, V>): ConditionMap<K, V> {
  return new ConditionMap(map)
}
