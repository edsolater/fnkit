import { assert, getValue, shrinkFn, type MayFn } from ".."
import { isNumber, isObject, isString, isUndefined } from "../dataType"
import { asyncInvoke } from "../functionManagers"

/** use seconds not milliseconds */
export type TimeType = number /* s */ | `${number}${"ms" | "s" | "m" | "h" | "H" | "d" | "D" | "W" | "M" | "Y"}`

export function isTimeType(time: any): time is TimeType {
  if (!isNumber(time) && !isString(time)) return false
  if (isNumber(time)) return true
  return /^[0-9]+\s?(ms|s|m|h|H|d|D|W|M|Y)$/.test(time)
}

/** to milliseconds */
export function parseTimeTypeToMilliseconds(time: TimeType) {
  if (isNumber(time)) return time * 1000
  if (time.endsWith("ms")) return Number.parseFloat(time)
  if (time.endsWith("s")) return Number.parseFloat(time) * 1000
  if (time.endsWith("m")) return Number.parseFloat(time) * 1000 * 60
  if (time.endsWith("h") || time.endsWith("H")) return Number.parseFloat(time) * 1000 * 60 * 60
  if (time.endsWith("d") || time.endsWith("D")) return Number.parseFloat(time) * 1000 * 60 * 60 * 24
  if (time.endsWith("W")) return Number.parseFloat(time) * 1000 * 60 * 60 * 24 * 7
  if (time.endsWith("M")) return Number.parseFloat(time) * 1000 * 60 * 60 * 24 * 30
  if (time.endsWith("Y")) return Number.parseFloat(time) * 1000 * 60 * 60 * 24 * 365
  throw new Error("Invalid time type")
}
export function parseTimeTypeToSeconds(time: TimeType) {
  if (isNumber(time)) return time
  if (time.endsWith("ms")) return Number.parseFloat(time) / 1000
  if (time.endsWith("s")) return Number.parseFloat(time)
  if (time.endsWith("m")) return Number.parseFloat(time) * 60
  if (time.endsWith("h") || time.endsWith("H")) return Number.parseFloat(time) * 60 * 60
  if (time.endsWith("d") || time.endsWith("D")) return Number.parseFloat(time) * 60 * 60 * 24
  if (time.endsWith("W")) return Number.parseFloat(time) * 60 * 60 * 24 * 7
  if (time.endsWith("M")) return Number.parseFloat(time) * 60 * 60 * 24 * 30
  if (time.endsWith("Y")) return Number.parseFloat(time) * 60 * 60 * 24 * 365
  throw new Error("Invalid time type")
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setIntervalWithSecondes(fn: (...args: any[]) => void, interval?: TimeType | undefined): number {
  // @ts-ignore
  return globalThis.setInterval(fn, interval ? parseTimeTypeToMilliseconds(interval) : undefined)
}

export type IntervalTaskFunction = (utils: {
  cancel: () => void
  /** start from 0 */
  loopIndex: number
  changeInterval: (newInterval: MayFn<TimeType, [oldIntervalSeconds: number]>) => void
  forceRunNextLoop: () => void
}) => void | Promise<void> | any | Promise<any>

export type SetIntervalOptions = {
  /** if you want run immediately after delay. both set `delay` and `immediate` */
  delay?: TimeType
  interval?: TimeType
  immediate?: boolean
  /** if set this, don't auto-run，相反，控制权交给返回的 Controller  */
  haveManuallyController?: boolean

  /**
   * TODO:还未实现
   * 当就任务未运行完成，新任务到达。
   * 此时如何面对新触发的任务。
   *
   * invoke-income: 默认。即使冲突了，也不做任何处理，直接触发触新任务
   * skip-income: 如果上一个任务未完成，直接跳过新的任务
   * queue-income: 如果上一个任务未完成，则将新的任务加入排队等待
   * cancel-prev-and-invoke-income: 若上一个任务未完成，则取消旧的任务，立刻运行新的任务
   *
   * or (prevTaskInvokeController) => any: 自定义冲突处理函数，
   * 接收上一个任务的控制器 (由AsyncInvoke给出，智能给出cancel的指示， 但是否能停下来看内部有没有打断点) 作为参数，可以通过它来取消上一个任务等操作
   *
   */
  whenTwoTaskConflict?:
    | "invoke-income"
    | "skip-income"
    | "queue-income"
    | "cancel-prev-and-invoke-income"
    | ((prevTaskInvokeController: any) => any)
}

export type SetIntervalController = {
  cancel(): void
  run(): void
  forceRunNextLoop(): void
}

export type SetIntervalVerboseOptions = SetIntervalOptions | TimeType
/**
 * build-in globalThis.setInterval is not human-friendly
 * @param taskFn function to run (run in future, event immediately, it will run in  micro task)
 * @param options
 * @returns
 */
export function setInterval(
  taskFn: IntervalTaskFunction,
  verboseOption?: SetIntervalVerboseOptions,
): SetIntervalController {
  // --- 内部状态 ---
  let loopIndex = 0
  let intervalTimeId = 0
  let initDelayTimeoutId = 0
  const taskRecorder: Map<
    string | number,
    {
      resultPromise: Promise<any>
      hasAborted: boolean // 该loop的任务是否被中止
    }
  > = new Map()

  // --- 配置参数 ---
  const options = {
    ...(isObject(verboseOption) ? verboseOption : {}),
    interval: parseTimeTypeToSeconds(
      isUndefined(verboseOption) ? 1 : isTimeType(verboseOption) ? verboseOption : (verboseOption.interval ?? 1),
    ),
    whenTwoTaskConflict: getValue(verboseOption, "whenTwoTaskConflict", "invoke-income"),
  }
  let intervalSeconds = options.interval

  function changeIntervalDuration(newInterval: MayFn<TimeType, [oldIntervalSeconds: number]>) {
    intervalSeconds = parseTimeTypeToSeconds(shrinkFn(newInterval, [intervalSeconds]))
    stopLoop()
    runLoop({ canWithImmediate: false })
  }

  function stopLoop() {
    clearTimeout(initDelayTimeoutId) // 初始触发前的设定的Delay
    clearInterval(intervalTimeId)
  }

  // 开启任务循环
  function runLoop(innerOptions: { canWithImmediate: boolean; forceImmediate?: boolean } = { canWithImmediate: true }) {
    const thisLoopIndex = loopIndex++

    // 运转每个单个循环内的任务
    async function execInputedTask() {
      // isTaskRunning就是冲突符号
      const hasRunningTask =
        taskRecorder.size > 0 && taskRecorder.values().some((record) => record.hasAborted === false)
      if (hasRunningTask) {
        // 进入冲突时的逻辑
        const whenConflict = options.whenTwoTaskConflict
        // 等待上一个任务完成后再执行本次任务
        const pastTaskId = thisLoopIndex - 1
        const prevTaskResultPromise = taskRecorder.get(pastTaskId)?.resultPromise
        assert(prevTaskResultPromise, "Thus isTaskRunning is true but no previous task found. this should not happen. ")

        if (whenConflict === "skip-income") {
          return prevTaskResultPromise
        } else if (whenConflict === "queue-income") {
          return prevTaskResultPromise.then(() => execInputedTask())
        } else if (whenConflict === "cancel-prev-and-invoke-income") {
          // TODO 还未写这个的逻辑，待继续
          // 取消上一个任务
          const pastTaskRecord = taskRecorder.get(pastTaskId)
          if (pastTaskRecord) {
            pastTaskRecord.hasAborted = true
          }
          return execInputedTask()
        }
      } else {
        // 进入未冲突时的逻辑
        const taskId = thisLoopIndex // 生成一个用于标识当前任务的ID
        const resultPromise = Promise.resolve(
          taskFn({
            loopIndex: thisLoopIndex,
            cancel: stopLoop,
            changeInterval: changeIntervalDuration,
            forceRunNextLoop: forceNext,
          }),
        ).finally(() => {
          taskRecorder.delete(taskId)
        })
        taskRecorder.set(taskId, { hasAborted: false, resultPromise }) // 记录当前任务状态
        return resultPromise
      }
    }

    /** 任务循环管理器 */
    function manageIntervalLoop(eachLoopFn: () => void) {
      /** 开启任务循环 */
      function startIntervalLoop() {
        if ((innerOptions.canWithImmediate && options?.immediate) || innerOptions.forceImmediate) eachLoopFn()
        intervalTimeId = setIntervalWithSecondes(eachLoopFn, intervalSeconds)
      }
  
      // 直接触发/延迟触发
      if (innerOptions.forceImmediate || options?.delay) {
        startIntervalLoop()
      } else {
        initDelayTimeoutId = setTimeoutWithSecondes(() => {
          startIntervalLoop()
        }, options.delay)
      }
    }

    manageIntervalLoop(execInputedTask)
  }

  // 强行触发下一次循环
  function forceNext() {
    stopLoop()
    runLoop({ canWithImmediate: true, forceImmediate: true })
  }

  // 立刻开始倒计时
  if (!options?.haveManuallyController) {
    runLoop()
  }

  return { cancel: stopLoop, run: runLoop, forceRunNextLoop: forceNext }
}

/**
 * build-in milliseconds is not human-friendly
 */
export function setTimeoutWithSecondes(fn: (...args: any[]) => void, delay?: TimeType | undefined): number {
  // @ts-ignore
  return globalThis.setTimeout(fn, delay ? parseTimeTypeToMilliseconds(delay) : undefined)
}

export type TimeoutTaskFunction = (utils: { loopCount: number; cancel: () => void }) => void

export type SetTimeoutOptions = {
  delay?: TimeType
  /** if set this, fn will run immediately, (two times total) */
  immediate?: boolean
  /** if set this, don't auto-run  */
  haveManuallyController?: boolean
}

export type SetTimeoutController = {
  cancel(): void
  run(): void
}

/**
 * build-in globalThis.setTimeout is not human-friendly
 * @param taskFn function to run (run in future, event immediately, it will run in  micro task)
 * @param options
 * @returns
 */
export function setTimeout(taskFn: TimeoutTaskFunction, _options?: SetTimeoutOptions | TimeType): SetTimeoutController {
  let loopCount = 0
  let timeId = 0

  const options: SetTimeoutOptions = isTimeType(_options) ? { delay: _options } : (_options ?? {})
  // core
  const runCore = () => asyncInvoke(() => taskFn({ loopCount: loopCount++, cancel }))

  function run() {
    if (options?.immediate) runCore()
    timeId = setTimeoutWithSecondes(runCore, options?.delay)
  }

  function cancel() {
    clearTimeout(timeId)
  }

  if (!options?.haveManuallyController) {
    run()
  }
  return { cancel, run }
}
