import shrinkToValue from '../wrapper/shrinkToValue'

export type CallbackCenterRegistedCallback<T> = (payloads: { data: T }) => void
export type CallbackCenterOptions = {
  canInitInvoke?: boolean
}
export type CallbackCenter<T> = {
  on: (
    inputCallback: CallbackCenterRegistedCallback<T>,
    options?: CallbackCenterOptions | undefined
  ) => void
  setData: (dispatch: T | ((prevData: T | undefined) => T)) => void
}
// TODO: should add debug entry
export function createCallbackCenter<T>(initData?: T): CallbackCenter<T> {
  const store = {
    callbacks: [] as {
      inputCallback: CallbackCenterRegistedCallback<T>
      options?: CallbackCenterOptions
    }[],
    data: initData
  }

  // TODO: should return abort controller
  const on: (
    inputCallback: CallbackCenterRegistedCallback<T>,
    options?: CallbackCenterOptions
  ) => void = (inputCallback, options) => {
    store.callbacks.push({ inputCallback, options })
    if (options?.canInitInvoke && store.data) {
      inputCallback({ data: store.data })
    }
  }
  const setData = (dispatch: T | ((prevData: T | undefined) => T)) => {
    const newData = shrinkToValue(dispatch, [store.data])
    store.data = newData
    store.callbacks.forEach((callback) => {
      callback.inputCallback({ data: newData })
    })
  }
  return { on, setData }
}
