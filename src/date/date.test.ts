import { formatDate } from "./stringifyDate"


test('date utils',()=>{
  expect(formatDate('2020-08-24 18:54', 'YYYY-MM-DD HH:mm')).toEqual('2020-08-24 18:54')
})