/**
 * 数据集工具（Array+Object）自动数据集
 * TODO: 未完待续
 */
export class Dataset {
  #array: any[] | null = null
  #object: Record<string, any> | null = null
  #objectKeys: string[] | null = null
  constructor(public data: any[] | Record<string, any>) {}

  /** 判断是否为空数据集 */
  get length(): number {
    return this._innerArrayLength + this._innerObjectLength
  }

  get _innerArrayLength(): number {
    return Array.isArray(this.#array) ? this.#array.length : 0
  }

  get _innerObjectLength(): number {
    return this.#objectKeys ? this.#objectKeys.length : 0
  }
}