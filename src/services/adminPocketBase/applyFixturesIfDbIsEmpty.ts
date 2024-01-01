import { random } from 'fp-ts'

import type { Logger } from '../../Logger'
import { ChampionPool } from '../../models/ChampionPool'
import { Dayjs } from '../../models/Dayjs'
import { LolElo } from '../../models/LolElo'
import { TeamRole } from '../../models/TeamRole'
import type { TournamentPhase } from '../../models/TournamentPhase'
import { LoserOf, WinnerOf } from '../../models/WinnerOrLoserOf'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { TableName } from '../../models/pocketBase/Tables'
import type { AttendeeInput } from '../../models/pocketBase/tables/Attendee'
import type { TournamentId, TournamentInput } from '../../models/pocketBase/tables/Tournament'
import type { UserId, UserInput } from '../../models/pocketBase/tables/User'
import { GameId } from '../../models/riot/GameId'
import { Puuid } from '../../models/riot/Puuid'

export async function applyFixturesIfDbIsEmpty(logger: Logger, pb: MyPocketBase): Promise<void> {
  const isEmpty = await isDbEmpty(pb)

  if (!isEmpty) {
    logger.info('Fixtures: db is not empty')
    return
  }

  logger.debug('Applying fixtures...')

  await addFixtures(pb)

  logger.info('Applied fixtures')
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

  const guy = await pb.collection('users').create(genUser('guy', 'Guy le mécano'))

  const tintin = await pb.collection('users').create(genUser('tintin', 'TINTIN'))

  const captain = await pb.collection('users').create(genUser('captain', 'Captain Craps'))

  const marie = await pb.collection('users').create(genUser('marie', 'Marie'))

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

  await pb
    .collection('attendees')
    .create(
      await genAttendee(
        tintin.id,
        tournament1.id,
        Puuid('YQLXLM9etyh_B74QjvlW6nWNsmvChJP2uig3llCtratiq2sruuX9pH8c0RVoO7j_xVaE_A0JRlKnRQ'),
      ),
    )

  await pb
    .collection('attendees')
    .create(
      await genAttendee(
        captain.id,
        tournament1.id,
        Puuid('Va3-hdGynMB4FMVbmT8N01DBue2OehklvdUYK-jJfRAfpnuoE4zgZy-0B82HgRU-pyF6YOgg653oGQ'),
      ),
    )
  await pb
    .collection('attendees')
    .create(
      await genAttendee(
        guy.id,
        tournament1.id,
        Puuid('b-z37sM-quwbTsD7M5Gk1AvhQpakpkZJfmedMT4ZxZ98B4VX1WD7F1szNU2687_Arr1jzTLdl2O-Ig'),
      ),
    )
  await pb
    .collection('attendees')
    .create(
      await genAttendee(
        marie.id,
        tournament1.id,
        Puuid('8-prW2qeG9-NSY3tM473FCzBR3jcWgjOPROsJIpp9bWlIuPC_0htvIRaDg8ZcbA6MSLc9ppPpCTXHg'),
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

  /* const match1 = */ await pb.collection('matches').create({
    tournament: tournament1.id,
    team1ResultsFrom: undefined,
    team1: team1.id,
    team2ResultsFrom: undefined,
    team2: team2.id,
    plannedOn: tournament1.start,
    apiData: GameId(6724906455),
  })

  const match2 = await pb.collection('matches').create({
    tournament: tournament1.id,
    team1ResultsFrom: undefined,
    team1: team1.id,
    team2ResultsFrom: undefined,
    team2: team3.id,
    plannedOn: Dayjs(tournament1.start).add(2, 'hours').toDate(),
    apiData: GameId(6725087844),
  })

  const match3 = await pb.collection('matches').create({
    tournament: tournament1.id,
    team1ResultsFrom: undefined,
    team1: team2.id,
    team2ResultsFrom: undefined,
    team2: team3.id,
    plannedOn: Dayjs(tournament1.start).add(4, 'hours').toDate(),
    apiData: undefined,
  })

  await pb.collection('matches').create({
    tournament: tournament1.id,
    team1ResultsFrom: WinnerOf(match2.id),
    team1: match2.team2 === '' ? undefined : match2.team2,
    team2ResultsFrom: WinnerOf(match3.id),
    team2: undefined,
    plannedOn: Dayjs(tournament1.start).add(6, 'hours').toDate(),
    apiData: undefined,
  })

  await pb.collection('matches').create({
    tournament: tournament1.id,
    team1ResultsFrom: LoserOf(match2.id),
    team1: match2.team1 === '' ? undefined : match2.team1,
    team2ResultsFrom: LoserOf(match3.id),
    team2: undefined,
    plannedOn: Dayjs(tournament1.start).add(8, 'hours').toDate(),
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
    comment: Math.random() < 0.5 ? '' : random.randomElem(comments)(),
    role: random.randomElem(TeamRole.values)(),
    championPool: random.randomElem(ChampionPool.values)(),
    birthplace: random.randomElem(places)(),
    avatar,
    isCaptain,
    seed: Math.random() < 0.5 ? undefined : random.randomInt(1, 5)(),
    price: Math.random() < 0.5 ? undefined : random.randomInt(1, 100)(),
  }
}

const comments: NonEmptyArray<string> = ['Adedigado.', 'ses a cause de mes mate', '???']

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
