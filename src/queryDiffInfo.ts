/**
 * query what's new what's removed and what's stay existed in the new array
 */
export function queryDiffInfo<T>(
  oldArray: T[],
  newArray: T[],
): { newAdded: T[]; noLongerExist: T[]; stayExisted: T[] } {
  const newItems = new Set(newArray)
  const removedItems = new Set(oldArray)
  const sameItems = new Set<T>()
  for (const item of newArray) {
    if (removedItems.has(item)) {
      removedItems.delete(item)
      sameItems.add(item)
    } else {
      newItems.add(item)
    }
  }
  return { newAdded: Array.from(newItems), noLongerExist: Array.from(removedItems), stayExisted: Array.from(sameItems) }
}
