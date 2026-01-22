/** 创建一个可变状态的管理器。这个标志有一个方法， 返回一个可等待的promise，当下是pending，当下一次标志被改变时，promise resolve */
export class StateSignalManager<T> {
  innerState: T | undefined

  private nextStateResolvers: ((state: T) => void)[] = []
  constructor(initialState?: T) {
    this.innerState = initialState 
    this.nextStateResolvers = []
  }
  getNextStateSignal(): Promise<T> {
    const { promise, resolve, reject } = Promise.withResolvers<T>()
    this.nextStateResolvers.push(resolve)
    return promise
  }
  changeState(state: T): void {
    this.innerState = state
    this.nextStateResolvers.forEach((resolve) => resolve(state))
  }
}
