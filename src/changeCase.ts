/**
 * @param str input string
 * @example
 * 'helloWorld' => ['hello', 'world']
 * 'helloWorldUI' => ['hello', 'world', 'ui']
 * 'helloWOrld' => ['hello', 'w', 'orld']
 * 'hello-world' => ['hello', 'world']
 * 'hello--world' => ['hello', 'world']
 * 'hello_world' => ['hello', 'world']
 * 'hello__world' => ['hello', 'world']
 * '_hello$world' => ['hello', 'world']
 */
function _parseString(str: string): string[] {
  return str
    .replace(/(?<![A-Z])[A-Z]/g, "-$&")
    .replace(/(?<=[A-Z])[A-Z](?=[a-z])/g, "-$&")
    .replace(/_/g, "-")
    .toLowerCase()
    .replace(/\W+/g, " ")
    .trim()
    .split(" ")
}

/**
 * @example
 * 'hello-world' => 'helloWorld'
 * 'HelloWorld' => 'helloWorld'
 * warning: '_hello' => 'hello'
 */
export function toCamelCase(str: string): string {
  return _parseString(str)
    .map((word, idx) => (idx === 0 ? word : capitalize(word)))
    .join("")
}

/**
 * @example
 * 'hello-world' => 'HelloWorld'
 */
export function toPascalCase(str: string): string {
  return _parseString(str)
    .map((word) => capitalize(word))
    .join("")
}

/**
 * @example
 * 'hello_World' => 'hello-world'
 */
export function toKebabCase(str: string) {
  return _parseString(str).join("-")
}

/**
 * @example
 * 'hello-world' => 'hello_world'
 */
export function toSnakeCase(str: string) {
  return _parseString(str).join("_")
}

/**
 * @example
 * 'hello-world' => 'hello_world'
 */
export function toConstantCase(str: string) {
  return toUpperCase(_parseString(str).join("_"))
}

/**
 * @example
 * 'hello-world' => 'hello-world'
 * 'HELLO_WORLD' => 'hello_world'
 */
export function toLowerCase(str: string) {
  return str.toLowerCase()
}

/**
 * @example
 * 'helloworld'=> 'HELLOWORLD'
 * 'hello_world' => 'HELLO_WORLD'
 */
export function toUpperCase(str: string) {
  return str.toUpperCase()
}

/**
 * @example
 * 'hello' => 'Hello'
 */
export function capitalize(str: string): Capitalize<string> {
  if (!str) return ""
  return (str[0].toUpperCase() + str.slice(1)) as Capitalize<string>
}

/**
 * @example
 * 'Hello' => 'hello'
 */
export function uncapitalize(str: string): Uncapitalize<string> {
  if (!str) return ""
  return (str[0].toLowerCase() + str.slice(1)) as Uncapitalize<string>
}

/**
 * @example
 * ('hello_world', {to: 'PascalCase' }) => 'HelloWorld'
 * (' hello world', {to: 'camelCase' }) => 'helloWorld'
 * ('hello-world', {to: 'CONSTANT_CASE' }) => 'HELLO_WORLD'
 */
export function changeCase(
  str: string,
  options: {
    to:
      | "camelCase"
      | "PascalCase"
      | "kebab-case"
      | "snake_case"
      | "CONSTANT_CASE" /* IDEA 增加属性：copyCaseFrom （就像 Word 的 ctrl + shift + C） */
  },
): string {
  switch (options.to) {
    case "camelCase":
      return toCamelCase(str)
    case "PascalCase":
      return toPascalCase(str)
    case "kebab-case":
      return toKebabCase(str)
    case "snake_case":
      return toSnakeCase(str)
    case "CONSTANT_CASE":
      return toConstantCase(str)
  }
}
