function isNumber(val: any): val is number {
  return typeof val === 'number'
}
export default isNumber