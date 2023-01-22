/**
 * result will be undefined if aborted
 * @param task task action
 * @returns
 */
export function makeTaskAbortable<T>(task: (canContinue: () => boolean) => T): {
  abort(): void
  hasFinished: () => boolean
  result: Promise<Awaited<T | undefined>>
} {
  let hasAbort = false
  const canContinue = () => !hasAbort
  const abort = () => {
    hasAbort = true
  }
  let finished = false
  const hasFinished = () => finished
  const result = Promise.resolve(task(canContinue)).then(
    (r) => {
      finished = true
      return hasAbort ? r : undefined
    },
    () => undefined
  ) as Promise<Awaited<T | undefined>> // typescript v4.8.3 isn't very cleaver
  return { abort, result, hasFinished }
}
