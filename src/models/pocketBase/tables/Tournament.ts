import type { MyBaseModel } from '../MyPocketBase'

export type Tournament = MyBaseModel & {
  name: string
  start: string
  end: string
  maxTeams: number
}
