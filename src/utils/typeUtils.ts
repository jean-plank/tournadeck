// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Expect<T extends true> =
  (<U>() => U extends U ? 1 : 2) extends <U>() => U extends true ? 1 : 2 ? true : false
