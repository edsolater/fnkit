/**
 * @see https://m.xp.cn/b.php/107696.html
 */

function getPrioratyOfChar(value: string) {
  switch (value) {
    case '+':
    case '-':
      return 1
    case '*':
    case '/':
      return 2
    default:
      return 0
  }
}

function isChar1PrioratyHigher(c1: string, c2: string) {
  return getPrioratyOfChar(c1) <= getPrioratyOfChar(c2)
}

function toRPN(exp: string) {
  const operatorStack = [] as string[]
  const resultRPN = [] as string[]

  for (const char of exp.replaceAll(' ', '')) {
    switch (char) {
      case '(': {
        operatorStack.push(char)
        break
      }
      case ')': {
        let po = operatorStack.pop()
        while (po != '(' && operatorStack.length > 0) {
          resultRPN.push(po!)
          po = operatorStack.pop()
        }
        if (po != '(') {
          throw 'error: unmatched ()'
        }
        break
      }
      case '+':
      case '-':
      case '*':
      case '/': {
        while (operatorStack.length > 0 && isChar1PrioratyHigher(char, operatorStack[operatorStack.length - 1])) {
          resultRPN.push(operatorStack.pop()!)
        }
        operatorStack.push(char)
        break
      }

      default: {
        resultRPN.push(char)
      }
    }
  }

  if (operatorStack.length > 0) {
    if (operatorStack.includes(')') || operatorStack.includes('(')) {
      throw 'error: unmatched ()'
    }
    while (operatorStack.length > 0) {
      resultRPN.push(operatorStack.pop()!)
    }
  }

  return resultRPN
}

console.time('sdf')
// console.log(toRPN('1 + 2'))
// console.log(toRPN('1 + 2 + 3'))
// console.log(toRPN('1 + 2 * 3'))
// console.log(toRPN('1 + 2 * 3 - 4 / 5'))
// console.log(toRPN('( 1 + 2 )'))
// console.log(toRPN('( 1 + 2 ) * ( 3 - 4 ) / 5'))
console.log(toRPN('( 1 + 2 ) * (( 3 - 4 ) *3*4 /     5)'))
console.timeEnd('sdf')
