import { pipe } from 'fp-ts/function'

import { config } from '../config'
import { logger } from '../logger'
import { DayJs } from '../models/DayJs'
import type { CreateModel } from '../models/pocketBase/MyPocketBase'
import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { TableName } from '../models/pocketBase/Tables'
import type { Tournament } from '../models/pocketBase/tables/Tournament'

export const adminPocketBase: Promise<MyPocketBase> = loadPb()

async function loadPb(): Promise<MyPocketBase> {
  const pb = MyPocketBase()

  await pb.admins.authWithPassword(config.ADMIN_PB_USERNAME, config.ADMIN_PB_PASSWORD)

  if (config.APPLY_FIXTURES) {
    await applyFixturesIfDbIsEmpty(pb)
  }

  return pb
}

async function applyFixturesIfDbIsEmpty(pb: MyPocketBase): Promise<void> {
  const isEmpty = await isDbEmpty(pb)

  if (!isEmpty) {
    logger.info('Fixtures: db is not empty')
    return
  }

  logger.info('Applying fixtures')

  await addFixtures(pb)
}

async function isDbEmpty(pb: MyPocketBase): Promise<boolean> {
  const collections = await pb.collections.getFullList()

  const results = await Promise.all(
    collections.map(c =>
      pb
        .collection(c.name as TableName)
        .getList(1, 1)
        .then(res => {
          console.log(c.name, res)
          return res
        }),
    ),
  )

  return results.every(result => result.totalItems === 0)
}

async function addFixtures(pb: MyPocketBase): Promise<void> {
  const tournament1 = await pb.collection('tournaments').create(genTournament())

  const team1 = await pb.collection('teams').create({
    tournament: tournament1.id,
    name: 'Les Shaclones',
  })
  const team2 = await pb.collection('teams').create({
    tournament: tournament1.id,
    name: 'Calmos',
  })
  const team3 = await pb.collection('teams').create({
    tournament: tournament1.id,
    name: 'La Sieste',
  })

  await pb.collection('matches').create({
    team1: team1.id,
    team2: team2.id,
    plannedOn: tournament1.start,
    apiData: {
      gameId: 6724906455,
      participants: [
        { teamId: 100, championId: 777 },
        { teamId: 100, championId: 63 },
        { teamId: 100, championId: 45 },
        { teamId: 100, championId: 51 },
        { teamId: 100, championId: 12 },
        { teamId: 200, championId: 80 },
        { teamId: 200, championId: 121 },
        { teamId: 200, championId: 101 },
        { teamId: 200, championId: 202 },
        { teamId: 200, championId: 143 },
      ],
    },
  })

  await pb.collection('matches').create({
    team1: team1.id,
    team2: team3.id,
    plannedOn: pipe(DayJs(tournament1.start), DayJs.add(12, 'hours'), DayJs.toDate),
    apiData: {
      gameId: 6725087844,
      participants: [
        { teamId: 100, championId: 78 },
        { teamId: 100, championId: 245 },
        { teamId: 100, championId: 25 },
        { teamId: 100, championId: 21 },
        { teamId: 100, championId: 910 },
        { teamId: 200, championId: 164 },
        { teamId: 200, championId: 79 },
        { teamId: 200, championId: 246 },
        { teamId: 200, championId: 67 },
        { teamId: 200, championId: 267 },
      ],
    },
  })

  await pb.collection('matches').create({
    team1: team2.id,
    team2: team3.id,
    plannedOn: tournament1.end,
    apiData: undefined,
  })
}

function genTournament(): CreateModel<Tournament> {
  const start = pipe(DayJs.now(), DayJs.add(7, 'days'))
  const end = pipe(start, DayJs.add(1, 'day'))

  return {
    name: 'Quais-Abattoirs party',
    start: DayJs.toDate(start),
    end: DayJs.toDate(end),
    maxTeams: 6,
  }
}
