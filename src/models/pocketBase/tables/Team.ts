import type { MyBaseModel } from '../MyPocketBase'

export type Team = MyBaseModel & {
  tournament: string
  name: string
}
