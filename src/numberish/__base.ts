// 工具：位长
function bitLen(v: bigint): bigint {
  if (v === 0n) return 0n
  let len = 0n,
    u = v < 0n ? -v : v
  while (u) {
    u >>= 1n
    len++
  }
  return len
}

const sinleMetaLength = 32n
/**
 * 拼接3个bigint为一个大bigint
 */
export function pack(a: bigint, b: bigint, c: bigint): bigint {
  const lenB = bitLen(b)
  const lenC = bitLen(c)
  const meta = (lenB << sinleMetaLength) | lenC // 64 bit 元数据
  const body = (a << (lenB + lenC)) | (b << lenC) | c
  return (body << (2n * sinleMetaLength)) | meta // meta 定长尾部 64 bit
}

// 解包：先 pop 尾部 64 bit，再按 lenB、lenC 切三段
export function unpack(v: bigint): [bigint, bigint, bigint] {
  const meta = v & ((1n << 64n) - 1n) // 最后 64 bit
  const lenB = meta >> sinleMetaLength
  const lenC = meta & 0xffffffffn
  const body = v >> (sinleMetaLength * 2n) // 去掉尾部的meta数据
  const maskC = (1n << lenC) - 1n
  const maskB = (1n << lenB) - 1n
  const c = body & maskC
  const b = (body >> lenC) & maskB
  const a = body >> (lenB + lenC)
  return [a, b, c]
}

// // 三个超大 BigInt（各自 > 64 bit）
// const a = 123456789012345678901234567890n;
// const b = 987654321098765432109876543210n;
// const c = 135792468013579246801357924680n;

// // 1. 打包成单值
// const packed = pack(a, b, c);
// console.log('packed :', packed); // 一个 BigInt

// // 2. 解包还原
// const [a2, b2, c2] = unpack(packed);
// console.log('a2     :', a2);
// console.log('b2     :', b2);
// console.log('c2     :', c2);

// // 3. 验证
// console.log('a 相等 ?', a === a2); // true
// console.log('b 相等 ?', b === b2); // true
// console.log('c 相等 ?', c === c2); // true

// ----------------
// 语义化BigNumber

type BigNumber = bigint
/**
 * 用于创建BigNumber
 */
function createBigNumber(
  numerator: bigint | number | string,
  denominator: bigint | number | string = 1n,
  decimal: bigint | number | string = 0n,
) {
  return pack(BigInt(numerator), BigInt(denominator), BigInt(decimal))
}

/**
 * 用于从BigNumber中提取 分子 分母 小数位数
 */
function unpackBigNumner(b: BigNumber): [bigint, bigint, bigint] {
  return unpack(b)
}
