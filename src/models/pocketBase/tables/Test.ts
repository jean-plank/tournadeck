import type { PbBaseModel } from '../pbModels'

export type Test = PbBaseModel & {
  label?: string | null
}
