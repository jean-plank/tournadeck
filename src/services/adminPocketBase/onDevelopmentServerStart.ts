import { random } from 'fp-ts'
import type { AdminAuthResponse } from 'pocketbase'
import { ClientResponseError } from 'pocketbase'

import { config } from '../../config'
import { logger } from '../../logger'
import { ChampionPool } from '../../models/ChampionPool'
import { Dayjs } from '../../models/Dayjs'
import { LolElo } from '../../models/LolElo'
import { TeamRole } from '../../models/TeamRole'
import type { TournamentPhase } from '../../models/TournamentPhase'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { TableName } from '../../models/pocketBase/Tables'
import type { AttendeeInput } from '../../models/pocketBase/tables/Attendee'
import type { TournamentId, TournamentInput } from '../../models/pocketBase/tables/Tournament'
import type { UserId, UserInput } from '../../models/pocketBase/tables/User'
import { Puuid } from '../../models/riot/Puuid'

export async function onDevelopmentServerStart(pb: MyPocketBase): Promise<void> {
  await initPocketBaseIfPbEmpty(pb)

  await applyFixturesIfDbIsEmpty(pb)
}

async function initPocketBaseIfPbEmpty(pb: MyPocketBase): Promise<void> {
  const response = await authWithPassword(pb).catch(e => {
    if (
      e instanceof ClientResponseError &&
      e.status === 400 &&
      e.response.message === 'Failed to authenticate.'
    ) {
      return undefined
    }
    throw e
  })

  const isEmpty = response === undefined

  if (!isEmpty) {
    logger.info('PocketBase: not empty')
    return
  }

  logger.info('Creating PocketBase admin and setting up Discord OAuth2')

  await pb.admins.create({
    email: config.POCKET_BASE_ADMIN_EMAIL,
    password: config.POCKET_BASE_ADMIN_PASSWORD,
    passwordConfirm: config.POCKET_BASE_ADMIN_PASSWORD,
  })

  await authWithPassword(pb)

  await pb.settings.update({
    discordAuth: {
      enabled: true,
      clientId: config.DISCORD_CLIENT_ID,
      clientSecret: config.DISCORD_CLIENT_SECRET,
    },
  })
}

function authWithPassword(pb: MyPocketBase): Promise<AdminAuthResponse> {
  return pb.admins.authWithPassword(
    config.POCKET_BASE_ADMIN_EMAIL,
    config.POCKET_BASE_ADMIN_PASSWORD,
    { cache: 'no-store' },
  )
}

// ---

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
  const collections = await pb.collections.getFullList({ cache: 'no-store' })

  const results = await Promise.all(
    collections.map(c => pb.collection(c.name as TableName).getList(1, 1, { cache: 'no-store' })),
  )

  return results.every(result => result.totalItems === 0)
}

export async function addFixtures(pb: MyPocketBase): Promise<void> {
  // users

  const jenaprank = await pb.collection('users').create(genUser('jenaprank', 'Jena Prank', true))

  const lambertj = await pb.collection('users').create(genUser('lambertj', 'Jules Lambert'))

  const adedigado = await pb.collection('users').create(genUser('adedigado', 'Jean Prendnote'))

  // tournaments

  const tournament1 = await pb
    .collection('tournaments')
    .create(genTournament('teamDraft', 'Quais-Abattoirs Party', 2, true))

  await pb.collection('tournaments').create(genTournament('created', 'L’anniversaire de Chloé', 4))

  // attendees

  await pb.collection('attendees').create(
    await genAttendee(
      jenaprank.id,
      tournament1.id,
      Puuid('8_scoVR3JLkqmPY__ov4uQ78ZEon7gi2B_XOtJW5gXX5BnSWM0EUv8scgsyPF5k116Mj9ZD084kceA'), // jeanprank
      true,
    ),
  )

  await pb.collection('attendees').create(
    await genAttendee(
      lambertj.id,
      tournament1.id,
      Puuid('e5ZZiNvlwntsAMB4cqgWcRiuOCxd1G5W3iG2mRkSdkRg24UeA8Zm-23psi7pdED8qxyXv_k1ak9IKA'), // grim
    ),
  )

  await pb.collection('attendees').create(
    await genAttendee(
      adedigado.id,
      tournament1.id,
      Puuid('oZst1CMmHY3E_j3JluDlsSzCVgLNkOqjFd73nQN5GJfjLzHoU17aocL2JDE787QSWXhWfXNYiUn1Sw'), // styrale
    ),
  )

  // teams

  const team1 = await pb.collection('teams').create({
    tournament: tournament1.id,
    name: 'Les Shaclones',
    tag: 'SHA',
  })

  const team2 = await pb.collection('teams').create({
    tournament: tournament1.id,
    name: 'Calmos',
    tag: 'CAL',
  })

  const team3 = await pb.collection('teams').create({
    tournament: tournament1.id,
    name: 'La Sieste',
    tag: 'LAS',
  })

  // matches

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
    plannedOn: Dayjs(tournament1.start).add(12, 'hours').toDate(),
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

// User

function genUser(username: string, displayName: string, isOrganiser = false): UserInput {
  const password = 'Password123'

  return {
    username,
    password,
    passwordConfirm: password,
    verified: true,
    emailVisibility: false,
    email: `${username}@x.t`,
    role: isOrganiser ? 'organiser' : 'attendee',
    displayName,
  }
}

// Tournament

function genTournament(
  phase: TournamentPhase,
  name: string,
  weeksFromNow: number,
  isVisible?: boolean,
): TournamentInput {
  const saturdayZero = Dayjs.now().add(weeksFromNow, 'weeks').startOf('week').set('day', 6)

  const start = saturdayZero.set('hour', 9)
  const end = saturdayZero.add(1, 'day').set('hour', 23)

  return {
    phase,
    name,
    start: start.toDate(),
    end: end.toDate(),
    teamsCount: 6,
    isVisible,
  }
}

// Attendee

async function genAttendee(
  user: UserId,
  tournament: TournamentId,
  puuid: Puuid,
  isCaptain?: boolean,
): Promise<AttendeeInput> {
  const avatar = await dlImage(`https://blbl.ch/img/${random.randomElem(images)()}`)

  return {
    user,
    tournament,
    puuid,
    currentElo: random.randomElem(LolElo.values)(),
    comment: Math.random() < 0.5 ? undefined : random.randomElem(comments)(),
    role: random.randomElem(TeamRole.values)(),
    championPool: random.randomElem(ChampionPool.values)(),
    birthplace: random.randomElem(places)(),
    avatar,
    isCaptain,
    seed: Math.random() < 0.5 ? undefined : random.randomElem(seeds)(),
    price: Math.random() < 0.5 ? undefined : random.randomInt(1, 100)(),
  }
}

const comments: NonEmptyArray<string> = ['Adedigado.', 'ses a cause de mes mate', '???']

const seeds: NonEmptyArray<string> = ['S', 'A', 'B', 'C', 'D', 'E']

const places: NonEmptyArray<string> = ['Mulhouse', 'Bagdadie', 'Marseille, bébé', 'Limoges MDR']

const images: NonEmptyArray<string> = [
  'balloons.png',
  'box.png',
  'dancing.png',
  'double.gif',
  'doubled_funcave.gif',
  'dr-pomf-couch.jpg',
  'dr-pomf-elevator.gif',
  'dr-pomf-solution.gif',
  'dr-pomf-symptoms.jpg',
  'eqg-scissors.gif',
  'eqg-sexy.jpg',
  'faceplant.png',
  'fluffle.png',
  'heavy-breathing.gif',
  'mirror_ponies.gif',
  'monopoly.gif',
  'my-pillow.gif',
  'NO-my-pillow.gif',
  'opc.gif',
  'open_up.gif',
  'pfudor.gif',
  'plz.gif',
  'pretty-crissy.gif',
  'pretty-crissy2.gif',
  'princess.png',
  'private.gif',
  'red_marker.png',
  'secretary.png',
  'snow.gif',
  'special_somepony.gif',
  'superpftfhtfp.png',
  'sweets.gif',
  'tea-time.gif',
  'uwot.gif',
]

async function dlImage(url: string): Promise<Blob> {
  const response = await fetch(url, { cache: 'no-store' })
  return await response.blob()
}
