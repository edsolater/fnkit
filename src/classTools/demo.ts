import { mixClasses } from "./mix"
import { Part } from "./DecoratorPart"

// ===== 测试代码 =====
class DataWriter {
  data: string = ""
  writeDate() {
    this.data = "2024-06-12 22:02:03.456"
    return this.data
  }
  static partName = "DataWriter"
  static getWriterInfo() {
    return `Writer: ${this.partName}`
  }
}

class DataReader {
  readDate(dateString: string) {
    // 可以访问 DataWriter 添加的 data 属性（状态共享）
    console.log("当前 data:", (this as any).data)
    return dateString.length
  }
  static partName2 = "DataReader"
  static getReaderInfo() {
    return `Reader: ${this.partName2}`
  }
}

class Data extends mixClasses(DataWriter, DataReader) {
  say() {
    return "hello"
  }
}

const d = new Data()
console.log(d.writeDate()) // "2024-06-12 22:02:03.456"
console.log(d.readDate("test")) // 访问共享的 data 属性
// 测试静态成员（现在有类型提示了）
const MixedData = mixClasses(DataWriter, DataReader)
console.log(MixedData.getWriterInfo()) // "DataWriter"
console.log(MixedData.partName) // "DataReader"
console.log(MixedData.getWriterInfo()) // "Writer: DataWriter"
console.log(MixedData.getReaderInfo()) // "Reader: DataReader"

console.log("\n===== 使用装饰器语法 =====\n")

// 使用装饰器语法
@Part(DataWriter, DataReader)
class DecoratedData {
  say() {
    return "hello from decorator"
  }
}

const dd = new DecoratedData()
console.log((dd as any).writeDate()) // "2024-06-12 22:02:03.456"
console.log((dd as any).readDate("test")) // 访问共享的 data 属性
console.log(dd.say()) // "hello from decorator"

// 测试装饰器类的静态成员（需要类型断言，因为 TS 无法推断装饰器改变后的类型）
const DecoratedDataCtor = DecoratedData as any
console.log(DecoratedDataCtor.partName) // "DataWriter"
console.log(DecoratedDataCtor.partName2) // "DataReader"
console.log(DecoratedDataCtor.getWriterInfo()) // "Writer: DataWriter"
console.log(DecoratedDataCtor.getReaderInfo()) // "Reader: DataReader"


