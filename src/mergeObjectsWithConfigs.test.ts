import { mergeObjectsWithConfigs } from './mergeObjects'

const s = Symbol('s')
test('test fn function:mergeObjectsWithConfigs', () => {
  expect(
    mergeObjectsWithConfigs([
      { a: 3, b: 4 },
      { a: 5, b: 6, c: 7 }
    ])
  ).toEqual({ a: 5, b: 6, c: 7 })
  expect(
    mergeObjectsWithConfigs(
      [
        { [s]: '3', a: 3, b: 4 },
        { [s]: '4', a: 5, b: 6, c: 7 }
      ],
      ({ key, valueA, valueB }) => `${String(key)}${valueA}${valueB}`
    )
  ).toEqual({ a: 'a35', b: 'b46', c: 7 , [s]: 's34'})
})
