import type { MyBaseModel } from '../MyPocketBase'

export type Test = MyBaseModel & {
  label?: string | null
}
