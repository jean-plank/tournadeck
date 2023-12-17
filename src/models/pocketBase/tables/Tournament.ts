import type { MyBaseModel } from '../MyPocketBase'

export type Tournament = MyBaseModel & {
  name: string
  start: Date | string
  end: Date | string
  maxTeams: number
}
