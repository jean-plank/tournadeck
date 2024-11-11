import { readonlyArray } from 'fp-ts'

import type { ChampionKey } from '../models/riot/ChampionKey'

const baseUrl = 'https://draftlol.dawe.gg'

const timePerPick = 60 // seconds

type RoomOptions = {
  t: ReadonlyArray<number>
  c: ReadonlyArray<ChampionKey>
  b: number // time per ban
  p: number
}

const base64regex = /^([^=]*)=*$/

export function draftlolLink(championsToBan: ReadonlyArray<ChampionKey>): string {
  const opts: Partial<RoomOptions> = {
    t: [0, 2, 4, 13, 15, 1, 3, 5, 12, 14], // disable bans
    ...(readonlyArray.isNonEmpty(championsToBan) ? { c: championsToBan } : {}),
    p: timePerPick,
  }

  const stringified = JSON.stringify(opts)
  const encoded = Buffer.from(stringified.substring(1, stringified.length - 1)).toString('base64')

  const trimed = encoded.match(base64regex)?.[1]

  if (trimed === undefined) {
    throw Error(`${JSON.stringify(encoded)} didn't match ${base64regex}`)
  }

  return `${baseUrl}?opts=${trimed}`
}
