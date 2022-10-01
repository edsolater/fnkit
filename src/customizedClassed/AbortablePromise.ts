export class AbortablePromise<T> extends Promise<T> {
  aborted: boolean
  private innerAbortController: AbortController

  constructor(
    exector: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void,
    forceAbortController: AbortController = new AbortController()
  ) {
    super(exector)
    this.innerAbortController = forceAbortController
    this.aborted = forceAbortController.signal.aborted
  }

  abort() {}
}

const a = new AbortablePromise((resolve, reject) => 3)
const c = new AbortController()
