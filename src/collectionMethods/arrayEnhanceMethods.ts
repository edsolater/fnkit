import { Collection, GetCollectionKey } from '.'
import { isArray, isMap, isSet } from '../dataType'

export function getKeys<T extends Collection>(collection: T): GetCollectionKey<T>[] {
  if (isMap(collection) || isArray(collection) || isSet(collection)) {
    // @ts-expect-error error for wrong type intelligense
    return [...collection.keys()]
  } else {
    // @ts-expect-error error for wrong type intelligense
    return Reflect.ownKeys(collection)
  }
}
