
/** 创建ID生成器
 * 
 * @example
 * ```ts
 * const idGenerator = new IdGenerator()
 * idGenerator.genID() // "1"
 * idGenerator.genID() // "2"
 * ```
 */
export class IdGenerator {
  private id = 1
  /** ID生成器的名称 */
  name: string

  constructor(name: string) {
    this.name = name
  }

  /** 生成唯一数字标识。 */
  genID() {
    return String(this.id++)
  }
}
