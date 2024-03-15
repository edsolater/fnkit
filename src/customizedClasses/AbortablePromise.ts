export class AbortablePromise<T> extends Promise<T> implements AbortController {
  private innerAbortController: AbortController
  /**
   * !not elegant
   * try not to use it, just use `.then()` and `.catch()`
   */
  promiseState: "pending" | "fulfilled" | "rejected" = "pending"

  constructor(
    exector: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
      abortSignal: AbortSignal,
    ) => void,
    forceAbortController: AbortController = new AbortController(),
  ) {
    super((resolve, reject) => exector(resolve, reject, forceAbortController.signal))
    this.innerAbortController = forceAbortController
    this.then(() => {
      this.promiseState = "fulfilled"
    }).catch(() => {
      this.promiseState = "rejected"
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

export function createAbortableAsyncTask<T>(
  task: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, aborted: () => boolean) => void,
): { result: Promise<T>; abort(): void } {
  const abortController = new AbortController()
  const abortableTask = new Promise<T>((resolve, reject) => {
    task(resolve, reject, () => abortController.signal.aborted)
  })
  return {
    result: abortableTask,
    abort: () => abortController.abort(),
  }
}
