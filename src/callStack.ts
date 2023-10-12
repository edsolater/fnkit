type Stack = {
  stack: string | undefined
}

/** for debug, should only use it in development mode */
export function getStack(): Stack {
  const err = new Error()
  const stack = err.stack
  return { stack }
}
