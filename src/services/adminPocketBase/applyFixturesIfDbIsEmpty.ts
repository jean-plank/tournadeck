import { random, readonlyArray, readonlyNonEmptyArray, task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import type { Logger } from '../../Logger'
import { genTournamentMatches } from '../../helpers/genTournamentMatches'
import { ChampionPool } from '../../models/ChampionPool'
import { Dayjs } from '../../models/Dayjs'
import { LolElo } from '../../models/LolElo'
import { TeamRole } from '../../models/TeamRole'
import type { TournamentPhase } from '../../models/TournamentPhase'
import type { MyPocketBase } from '../../models/pocketBase/MyPocketBase'
import type { TableName } from '../../models/pocketBase/Tables'
import type { AttendeeInput } from '../../models/pocketBase/tables/Attendee'
import { TeamId } from '../../models/pocketBase/tables/Team'
import type { TournamentId, TournamentInput } from '../../models/pocketBase/tables/Tournament'
import type { UserId, UserInput } from '../../models/pocketBase/tables/User'
import { GameId } from '../../models/riot/GameId'
import { Puuid } from '../../models/riot/Puuid'
import { array, isDefined } from '../../utils/fpTsUtils'
import { promiseSequenceSeq } from '../../utils/promiseUtils'

export async function applyFixturesIfDbIsEmpty(logger: Logger, pb: MyPocketBase): Promise<void> {
  const isEmpty = await isDbEmpty(pb)

  if (!isEmpty) {
    logger.info('Fixtures: db is not empty')
    return
  }

  logger.debug('Applying fixtures...')

  await addFixtures(logger, pb)

  logger.info('Applied fixtures')
}

async function isDbEmpty(pb: MyPocketBase): Promise<boolean> {
  const collections = await pb.collections.getFullList({ cache: 'no-store' })

  const results = await Promise.all(
    collections.map(c => pb.collection(c.name as TableName).getList(1, 1, { cache: 'no-store' })),
  )

  return results.every(result => result.totalItems === 0)
}

export async function addFixtures(logger: Logger, pb: MyPocketBase): Promise<void> {
  // tournaments

  const tournament1 = await pb
    .collection('tournaments')
    .create(genTournament('teamDraft', 'Quais-Abattoirs Party', 2, true))

  await pb.collection('tournaments').create(genTournament('created', 'L’anniversaire de Chloé', 4))

  // teams

  const teams = [
    await pb.collection('teams').create({
      tournament: tournament1.id,
      name: 'Les Shaclones',
      tag: 'SHA',
    }),

    await pb.collection('teams').create({
      tournament: tournament1.id,
      name: 'Calmos',
      tag: 'CAL',
    }),

    await pb.collection('teams').create({
      tournament: tournament1.id,
      name: 'La Sieste',
      tag: 'LAS',
    }),

    await pb.collection('teams').create({
      tournament: tournament1.id,
      name: 'Adedigado',
      tag: 'ADE',
    }),

    await pb.collection('teams').create({
      tournament: tournament1.id,
      name: 'SKT T1',
      tag: 'T1',
    }),

    await pb.collection('teams').create({
      tournament: tournament1.id,
      name: 'C T SUR ENFAIT',
      tag: 'CTS',
    }),
  ] as const

  const [, team2] = teams

  // users and attendees

  const teamsCount = 6

  await promiseSequenceSeq(
    TeamRole.values.map(async (role, i) => {
      const users = await promiseSequenceSeq(
        Array.from({ length: teamsCount }).map((_, j) => {
          const index = i * teamsCount + j
          const username = `user-${index}`

          logger.debug(`Creating user ${username}`)

          try {
            return pb.collection('users').create(genUser(username, `User ${index + 1}`))
          } catch {
            throw Error(`Error while creating user ${username}`)
          }
        }),
      )

      const usersWithSeed = pipe(
        users,
        readonlyArray.zip(array.shuffle(readonlyNonEmptyArray.range(1, teamsCount))()),
      )

      const captain = readonlyArray.isNonEmpty(users) ? random.randomElem(users)() : undefined

      await promiseSequenceSeq(
        usersWithSeed.map(async ([user, seed], j) => {
          const puuidIndex = i * teamsCount + j
          const puuid = puuids[puuidIndex]

          if (puuid === undefined) {
            throw Error(`Puuid with index ${puuidIndex} doesn't exist`)
          }

          const team = teams[j]

          if (team === undefined) {
            throw Error(`team with index ${j} doesn't exist`)
          }

          return pb
            .collection('attendees')
            .create(
              await genAttendee(
                user.id,
                tournament1.id,
                puuid,
                team.id,
                role,
                user.id === captain?.id,
                seed,
              ),
            )
        }),
      )
    }),
  )

  // matches

  const matches = genTournamentMatches(tournament1.id, teams)

  let incr = 0

  if (matches !== undefined) {
    await pipe(
      matches,
      readonlyArray.traverse(task.ApplicativeSeq)(
        match => () =>
          pb.collection('matches').create({
            ...match,
            apiData: (() => {
              if (match.round.type === 'GroupRound') {
                const teamIds = [
                  match.team1 !== '' ? match.team1 : undefined,
                  match.team2 !== '' ? match.team2 : undefined,
                ].filter(isDefined)

                if (readonlyArray.elem(TeamId.Eq)(team2.id, teamIds)) {
                  incr++

                  if (incr === 1) return [GameId(6747028433)]
                  if (incr === 2) return [GameId(6748352383)]
                }
              }

              return match.apiData
            })(),
          }),
      ),
    )()
  }
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
  isVisible: boolean = false,
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
    bannedChampions: [],
  }
}

// Attendee

async function genAttendee(
  user: UserId,
  tournament: TournamentId,
  puuid: Puuid,
  team: TeamId,
  role: TeamRole,
  isCaptain: boolean,
  seed: number,
): Promise<AttendeeInput> {
  const avatar = await dlImage(`https://blbl.ch/img/${random.randomElem(images)()}`)

  return {
    user,
    tournament,
    puuid,
    currentElo: random.randomElem(LolElo.values)(),
    comment: Math.random() < 0.2 ? '' : random.randomElem(comments)(),
    team,
    role,
    championPool: random.randomElem(ChampionPool.values)(),
    birthplace: random.randomElem(places)(),
    avatar,
    isCaptain,
    seed,
    avatarRating: Math.random() < 0.2 ? 0 : random.randomInt(0, 5)(),
    price: Math.random() < 0.5 ? 0 : random.randomInt(1, 100)(),
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

const puuids: ReadonlyArray<Puuid> = [
  '8_scoVR3JLkqmPY__ov4uQ78ZEon7gi2B_XOtJW5gXX5BnSWM0EUv8scgsyPF5k116Mj9ZD084kceA',
  'oZst1CMmHY3E_j3JluDlsSzCVgLNkOqjFd73nQN5GJfjLzHoU17aocL2JDE787QSWXhWfXNYiUn1Sw',
  'e5ZZiNvlwntsAMB4cqgWcRiuOCxd1G5W3iG2mRkSdkRg24UeA8Zm-23psi7pdED8qxyXv_k1ak9IKA',
  'Va3-hdGynMB4FMVbmT8N01DBue2OehklvdUYK-jJfRAfpnuoE4zgZy-0B82HgRU-pyF6YOgg653oGQ',
  '8-prW2qeG9-NSY3tM473FCzBR3jcWgjOPROsJIpp9bWlIuPC_0htvIRaDg8ZcbA6MSLc9ppPpCTXHg',
  'YQLXLM9etyh_B74QjvlW6nWNsmvChJP2uig3llCtratiq2sruuX9pH8c0RVoO7j_xVaE_A0JRlKnRQ',
  'b-z37sM-quwbTsD7M5Gk1AvhQpakpkZJfmedMT4ZxZ98B4VX1WD7F1szNU2687_Arr1jzTLdl2O-Ig',
  '00JVgMQhZ4GAtohnW4rU_bvFckyCo3ev0r_hthAtU82PhIf4RLZzLFz7J3iemZX_J5HlbuyTNd4Rwg',
  '-eh6X2DGw_sl8kkHcdZZCRZ0aDXXmewWA2cV2EUXiesadwJ22F74vJuD95Dq6MkHxz4io5eLg2aLqg',
  '1fXnZSoWIVLlZr_ZUbwYRtl-GVppH-yrWsTR3pTOx2BbCTaDb4HAsQnBSMG8yyLkOkc294Rhr1gzpg',
  'CRe16w6NRV6dmuhd-rpF_jAxHyAnC4-88hTrEIhCPL5Pl_ejegRNpWTyCsO6sHHLk0_Uj6rs8V3a2g',
  '5N1S-XZ0R4g90jrtdGwlUidXEz0fAF4O6ucs1RKTxxHfeA9zLf9zAmzVMLOUqqhjzSc3Kq_fere84w',
  '2FW6AAeJgQPtZv5f5n10uO8paxfRs9ElBsE1d-IXdBVObK7lOjUAcIT0W6oK6HG65KSEYeug02Uhvg',
  '3bbHrEuvVpXq2ukEGcTaC-DTfFSvRMTWqAlg81hEqxbH-QvBmwZR_vDikolWSNfl9lNCjPNafY73OQ',
  '6uU85SWQYy7fAjcIkJ9O7TtaVOj5vCwlzbzk4VlJR_hPwASzCaga6zAjYRK0GLIYl_GlIjiZ4imzNg',
  '6H8AIXvSRmd5Darh8mvBPztPOnSRm40uqrNk8OODOi0goyGzGsgqz3vwUDgQj6HRUeLpK0clvQYsZw',
  'kFuqw4vxHRr-NWt8AhjFH-SPInBu2DmmoLSd4fP-IqNK9EvHTCK_H6He9H-86pHMFrPl3Hb2-zJ8tA',
  '3N_ZnTERKZdsJTpWX8vpi9Mueg9d76aTbQ5JjE44iwJ2eYvgeheSo-nc3b1ryUnngcp8QSdxLWp3TA',
  'DhxDfwKIxHidGGLozOMXqmCnJR3arxPmEk_HYFhLPw6NI17TqtWXQUgxelUtYBHBXv_f0DaT3xfszw',
  '8VXHj09qe4MZRQadHHqNrtoEPb-KK1ph2EkBKRoxhkY1gDHn3pZDxJr_HulgjKAXKL1UpeighVdYKg',
  '7piSt81ltxiFg0tSNbxPaRBPqh60rsS5XdwtCw3CsdxevdpnbV4ysw5G545p3GU5CLtXw1le-i975A',
  'QCFSz6IHMa2ohD3DYqZgmqDk-xmvd7j3Jzbzwz5hQBqB1hJA8VSLUzef-_7KnEPaepDTmlnjwclKHQ',
  'C-ShGi05HAK7EKJeyFpnNRbR2XD6Iumcr1e5gx-pxWVo01eZZYhEy9n9wd1pB4IefE-tyWT0zInrSQ',
  '_3Qc2AZUhVHQiS34rcqoXsm5fnkyMC_e6CdJa1WUAYX08mFpFsMkswvzDd5c-nvmC44GWQVaNG8W8w',
  'ic3uRzP5PxVUDM57WREVMsA1s6Hn9ehkj7D39dCysZWYHw2kSUO8BOZRLT6psprmcPJHf6-j3H6M6A',
  'Jrl1IQcHU4b0ffirLjDClauPTWTTV7iXFpcSz78fYeGA2fG0hG6E-2TuQA-DsZ9KbnCrWb3LLx3hrQ',
  'wYS3X9hLzYAStINqspyinNmhU5aA3UsovYCmUZ_l-ZGbO-CtxMXQ5qiufXCf74Rh1aB-WDzBVjY-tg',
  'mdyR74eCkuLNahbT07iRIj1GOSVTZbTEhw8UZWJF4IeP6cBu3CZNrHYhbO6zgtJcIqs1UVX8ZXzzWA',
  'f8UoiSD1FlA0NfiVc9xjEojOapUR9pQBNVUqTV9lpdZDXpxZH5iVf6JHGGLldvOqhBpu2JJIwu-jZQ',
  '_mS44qHCWhFFscnKCIWeHzebYyPNG3SotlJBvw7c1uB6XgtLZTR8DzVCATSks-drWPM8EE18xsfMpw',
  // 'amjvu6waJNJmZNIZS1icLuSrYm3_j5L7JwolxI4bZABP0xFGZKhhBenh3871g0nG4wT6y8cmHNsZzA',
  // 'LNxFxuyyhZ3ozc3F4OuFyuLAxGzqb2n9aIKO2P3S1btbPYnVO46vk2zmSha_v4_BK2OQ0cj-jOmJnQ',
  // 'vyGmYfuPeOUcL9qwo1YIChrQTCTK33w5_Ar6zhzNxP0JvQceqLTzsptNPvpAVFiKHzSpGW5-_Y3LBg',
  // 'h4eeQJ13ief-XjZ7Mp8LqTyjxmQrdi7hd1GMDtxI5dTn72lnJ3H_aTeuIxe7F7W7j0Oz_JFtLj6jGQ',
  // 'N-Tei3nYBv2FLf4fA94MjbodoETndnnh9-KTviWV_q4xtWhmiIRVk_upjCO94w2ilC72Uh_2I3XKYw',
  // 'HtvGcsXf9YkbGmfaYyutKTU-_n20P6Qj2w6OHmk_rsXR1uIfvsaKRWjhlJhQvpliYD6nSvacIH8-SA',
  // 'amjSwLs80xnZqad5uMLPQPnYXVaphcb6htI16KtCbIFl1XGIw91uqQJg98E1Mub-gwOPgFbfGgacmg',
  // 'ReJwODcAZy7rwquMw2xSQr5clSnEaUgozH5P-Uk7-rRANr72i6vAnEiW3P_9iV_7L7njtMqrcQ-LGw',
  // 'imp0f9turJbigLi_RnlCfiMJfXzqT09JoFHWhk-VD8gMcRyJri9wgdlbLuhUgr3nxr1HSUigC68XkQ',
  // 'iQkkpTkECDtQv9Hmj28c6Z2R_AY-ARNuAPERP-2SPUtSetdRDYTJmpoAGnYToyt0djKk__10cJuuDw',
  // 'DioIDlJYoyexMBBPKjrSKLOfsWp50WtD410FXq9Dnkci7FkJGPcDA6l3v4bA86-ECM7j4_ulSnEc5Q',
  // 'VCueB2aA9XdrjEc31q6WGbo7kqDGm8jggDN4JmzzadX42F-VJvB9dfbRg90BkF84OPdfCQqxhTMWQQ',
  // 'l3kmj1abuxpvQaSft6JAmaroJzC9FGbDEnIFt6qMKZ5fd_m9CfTHcDpLOGJ-HR_5WNrzlqU9-Rj2hQ',
  // '9-4XLjjMvf-aIOXG5N9NI__Zsygf5HthqeDfngUyHR3BOZyn_aUYw_kDf94k7zEEVdK7shi6DmL7sQ',
  // '3uxaCr9dkbZbFTrk-OeJl6c82G_SsS-CAxaT9PQ1yJ07aFFR___7NPGhlQIkJy2QolZTbMXwd6Hwrw',
  // 'Gg_RNC3-YTdSmS8IG8z_8c1mZpRwPLhDfkpz28Eq5ZGBEKMtUjpn3614mLsI83TZyYhtuPrsmqIt1g',
  // 's6FQ1lI2RuK5tiUDe6WRbCaAykmerSFeJXG6BW9VjHvEoiasVs2IO1Eqy_LoWqBjXGeforYRDHiWbw',
  // 'w6CMLXNQWj8k7-2cIVETe4RP9IZoJflTVdoTdS3zc1fouwfoDH9Tu_hDpVXrMhW1HM5KPgVuGdiCUA',
  // 'wu9bPfc19I8DNwMf06XJ4IfyRgJqFKDf_85hTQMywL1nPuV4Eb1hXY1VLkhWaPMxMCI8PKn2kiwJBQ',
  // 'zNJgHmkBAs8kMzmRpcqN6NtMTv91UH0-tXoJZ5TPosh37uAMMn648eNBcTk2pMysI9vh3RT_eV3rFw',
].map(a => Puuid(a))

async function dlImage(url: string): Promise<Blob> {
  const response = await fetch(url, { cache: 'no-store' })
  return await response.blob()
}
