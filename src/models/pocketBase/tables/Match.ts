import type { MyBaseModel } from '../MyPocketBase'

export type Match = MyBaseModel & {
  team1: string
  team2: string
  plannedOn: Date | string
  apiData: unknown
}
