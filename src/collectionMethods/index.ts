export * from './collection.type'

export { default as concat } from './concat'

export { default as drop } from './drop'
export * from './drop'

export { default as every } from './every'
export * from './every'

export { default as filter } from './filter'
export * from './filter'

export { default as find } from './find'
export * from './find'

export { default as flap, flapDeep } from './flap'

export { default as forEach } from './forEach'
export * from './forEach'

export * from './groupBy'

export { default as insert } from './insert'
export * from './insert'

export * from './map'
export { default as map } from './map'

export * from './reduce'

// TODO isolate flatMap() (2022-06-10)
export * from './shakeNil'
export { default as some } from './some'

// TODO: changeCollectionType: (oldCollection, targetType: 'array' | 'object' | 'set' | 'map') => newCollection

export * from './arrayEnhanceMethods'


/** @dreprecated */
export * from './entries'