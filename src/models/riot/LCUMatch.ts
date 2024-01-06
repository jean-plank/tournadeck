import { option, readonlyArray, readonlyRecord, task } from 'fp-ts'
import type { Task } from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import type { Except, Merge, OverrideProperties } from 'type-fest'

import { array, partialRecord } from '../../utils/fpTsUtils'
import { DateFromNumber } from '../../utils/ioTsUtils'
import { Dayjs, DayjsDuration } from '../Dayjs'
import type {
  TheQuestMatch,
  TheQuestMatchParticipant,
  TheQuestMatchTeam,
} from '../theQuest/TheQuestMatch'
import { ChampionId } from './ChampionId'
import { ChampionKey } from './ChampionKey'
import { GameId } from './GameId'
import { GameName } from './GameName'
import { Puuid } from './Puuid'
import { RiotId } from './RiotId'
import { RiotTeamId } from './RiotTeamId'
import { TagLine } from './TagLine'

type LCUMatchParticipant = D.TypeOf<typeof participantDecoder>

const participantDecoder = D.struct({
  participantId: D.number,
  teamId: RiotTeamId.codec,
  championId: ChampionKey.codec,
  stats: D.struct({
    assists: D.number,
    deaths: D.number,
    goldEarned: D.number,
    kills: D.number,
  }),
})

// ---

const secondsDecoder = pipe(
  D.number,
  D.map(seconds => DayjsDuration({ seconds })),
)

// ---

type RawLCUMatch = D.TypeOf<typeof rawDecoder>

const rawDecoder = D.struct({
  platformId: D.literal('EUW1'),
  gameId: GameId.codec,
  gameCreation: DateFromNumber.decoder,
  gameDuration: secondsDecoder,
  participantIdentities: D.array(
    D.struct({
      participantId: D.number,
      player: D.struct({
        gameName: GameName.codec,
        tagLine: TagLine.codec,
        profileIcon: D.number,
      }),
    }),
  ),
  participants: D.array(participantDecoder),
  teams: D.array(
    D.struct({
      teamId: RiotTeamId.codec,
      win: D.literal('Win', 'Fail'),
    }),
  ),
})

type LCUMatch = OverrideProperties<
  Merge<
    Except<RawLCUMatch, 'participants'>,
    {
      win: RiotTeamId
    }
  >,
  {
    teams: Partial<ReadonlyRecord<`${RiotTeamId}`, LCUMatchTeam>>
  }
>

type LCUMatchTeam = Merge<
  Except<RawLCUMatch['teams'][number], 'teamId' | 'win'>,
  {
    participants: ReadonlyArray<LCUMatchParticipant>
  }
>

const decoder = pipe(
  rawDecoder,
  D.map(
    (m): LCUMatch => ({
      platformId: m.platformId,
      gameId: m.gameId,
      gameCreation: m.gameCreation,
      gameDuration: m.gameDuration,
      participantIdentities: m.participantIdentities,
      teams: pipe(
        m.teams,
        array.groupBy(t => t.teamId),
        partialRecord.map((teams_): Optional<LCUMatchTeam> => {
          if (teams_ === undefined) return undefined

          const [team] = teams_

          return {
            participants: pipe(
              m.participants,
              readonlyArray.filter(p => RiotTeamId.Eq.equals(p.teamId, team.teamId)),
            ),
          }
        }),
      ),
      win: pipe(
        m.teams,
        readonlyArray.findFirst(t => t.win === 'Win'),
        option.fold(
          (): RiotTeamId => 100,
          t => t.teamId,
        ),
      ),
    }),
  ),
)

const toTheQuestMatch =
  (
    championIdFromKey: (id: ChampionKey) => Optional<ChampionId>,
    puuidFromRiotId: (riotId: RiotId) => Promise<Optional<Puuid>>,
  ) =>
  async (m: LCUMatch): Promise<TheQuestMatch> => {
    return {
      platform: 'EUW',
      id: m.gameId,
      gameCreation: m.gameCreation,
      gameDuration: m.gameDuration,
      gameEndTimestamp: Dayjs(m.gameCreation).add(m.gameDuration).toDate(),
      teams: await pipe(
        m.teams as ReadonlyRecord<`${RiotTeamId}`, LCUMatchTeam>,
        readonlyRecord.traverse(task.ApplicativeSeq)(teamToTheQuest),
      )(),
      win: m.win,
    }

    function teamToTheQuest(team: Optional<LCUMatchTeam>): Task<Optional<TheQuestMatchTeam>> {
      if (team === undefined) return task.of(undefined)

      return pipe(
        team.participants,
        readonlyArray.traverse(task.ApplicativeSeq)(
          p => async (): Promise<TheQuestMatchParticipant> => {
            const identity = m.participantIdentities.find(i => i.participantId === p.participantId)

            const riotId =
              identity !== undefined
                ? RiotId(identity.player.gameName, identity.player.tagLine)
                : undefined

            const puuid = riotId !== undefined ? await puuidFromRiotId(riotId) : undefined

            return {
              assists: p.stats.assists,
              championName: championIdFromKey(p.championId) ?? ChampionId('undefined'),
              deaths: p.stats.deaths,
              goldEarned: p.stats.goldEarned,
              kills: p.stats.kills,
              profileIcon: identity?.player.profileIcon ?? -1,
              puuid: puuid ?? Puuid(''),
              riotId: riotId ?? RiotId(GameName('undefined'), TagLine('undef')),
            }
          },
        ),
        task.map(
          (participants): TheQuestMatchTeam => ({
            participants,
          }),
        ),
      )
    }
  }

const LCUMatch = { decoder, toTheQuestMatch }

export { LCUMatch }
