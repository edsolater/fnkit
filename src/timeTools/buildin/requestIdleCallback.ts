/**
 * TODO：未审核（代码由AI生成）
 */

type IdleDeadlineLike = {
  didTimeout: boolean
  timeRemaining(): number
}

type RequestIdleCallbackOptionsLike = {
  timeout?: number
}

/**
 * 浏览器原生的 requestIdleCallback 没有稳定的跨环境支持，这里补一层兼容封装
 */
export function runBuildinRequestIdleCallback(
  fn: (deadline: IdleDeadlineLike) => void,
  options?: RequestIdleCallbackOptionsLike,
): number {
  if (globalThis.requestIdleCallback) {
    return globalThis.requestIdleCallback(fn, options)
  }

  // @ts-ignore
  return globalThis.setTimeout(() => fn(createFallbackIdleDeadline()), options?.timeout)
}

function clearIdleCallback(taskId: number) {
  if (globalThis.cancelIdleCallback) {
    globalThis.cancelIdleCallback(taskId)
    return
  }
  globalThis.clearTimeout(taskId)
}

function createFallbackIdleDeadline(): IdleDeadlineLike {
  const startAt = Date.now()
  return {
    didTimeout: false,
    timeRemaining() {
      return Math.max(0, 50 - (Date.now() - startAt))
    },
  }
}

export type RequestIdleCallbackTaskFunction = (utils: {
  taskId: number
  deadline: IdleDeadlineLike
  cancel: () => void
}) => void

export type RequestIdleCallbackOptions = {
  /** 立刻执行一次函数，但同时仍会继续注册一次空闲回调 */
  immediate?: boolean

  /** 透传给浏览器的 timeout 配置；降级到 setTimeout 时也会复用 */
  timeout?: number

  /** 需要手动触发，使用调用 RequestIdleCallbackController.start */
  haveManuallyController?: boolean
}

export type RequestIdleCallbackController = {
  /** 取消已注册的空闲任务 */
  cancel(): void

  /** 当还有 options.haveManuallyController 时，start 方法用于手动触发 */
  start(): void
}

/**
 * 浏览器空闲时执行任务；不支持 requestIdleCallback 的环境会自动降级到 setTimeout
 */
export function requestIdleCallback(
  taskFn: RequestIdleCallbackTaskFunction,
  rawOptions?: RequestIdleCallbackOptions,
): RequestIdleCallbackController {
  let taskId = 0
  const options = rawOptions ?? {}

  const runCore = (deadline: IdleDeadlineLike) => taskFn({ taskId, deadline, cancel })

  function start() {
    if (options.immediate) runCore(createFallbackIdleDeadline())
    taskId = runBuildinRequestIdleCallback(runCore, { timeout: options.timeout })
  }

  function cancel() {
    clearIdleCallback(taskId)
  }

  if (!options.haveManuallyController) {
    start()
  }

  return { cancel, start }
}