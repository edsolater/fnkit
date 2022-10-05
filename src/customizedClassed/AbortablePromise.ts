export class AbortablePromise<T> extends Promise<T> implements AbortController {
  private innerAbortController: AbortController
  /**
   * !not elegant
   * try not to use it, just use `.then()` and `.catch()`
   */
  promiseState: 'pending' | 'fulfilled' | 'rejected' = 'pending'

  constructor(
    exector: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
      abortSignal: AbortSignal
    ) => void,
    forceAbortController: AbortController = new AbortController()
  ) {
    super((resolve, reject) => exector(resolve, reject, forceAbortController.signal))
    this.innerAbortController = forceAbortController
    this.then(() => {
      this.promiseState = 'fulfilled'
    }).catch(() => {
      this.promiseState = 'rejected'
    })
  }

  get aborted() {
    return this.innerAbortController.signal.aborted
  }

  get signal() {
    return this.innerAbortController.signal
  }

  abort() {
    return this.innerAbortController.abort()
  }
}
