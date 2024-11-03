import Image from 'next/image'
import type { Merge } from 'type-fest'

import { CroppedChampionSquare } from '../../../../../components/CroppedChampionSquare'
import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { ChampionId } from '../../../../../models/riot/ChampionId'
import type { DDragonVersion } from '../../../../../models/riot/DDragonVersion'
import { GameName } from '../../../../../models/riot/GameName'
import { RiotId } from '../../../../../models/riot/RiotId'
import { TagLine } from '../../../../../models/riot/TagLine'
import type { TheQuestMatchParticipant } from '../../../../../models/theQuest/TheQuestMatch'
import { cx } from '../../../../../utils/cx'

type Props = {
  version: DDragonVersion
  left: ReadonlyArray<EnrichedParticipant>
  right: ReadonlyArray<EnrichedParticipant>
}

export type EnrichedParticipant = Merge<
  TheQuestMatchParticipant,
  { member: Optional<AttendeeWithRiotId> }
>

export const MatchTooltip: React.FC<Props> = ({ version, left, right }) => (
  <div className="grid grid-cols-2 gap-4">
    <ul className="flex flex-col gap-2">
      {left.map(p => (
        <Participant key={p.puuid} version={version} {...p} reverse={false} />
      ))}
    </ul>

    <ul className="flex flex-col gap-2">
      {right.map(p => (
        <Participant key={p.puuid} version={version} {...p} reverse={true} />
      ))}
    </ul>
  </div>
)

type ParticipantProps = Merge<
  {
    version: DDragonVersion
    reverse: boolean
  },
  EnrichedParticipant
>

const Participant: React.FC<ParticipantProps> = ({
  version,
  assists,
  championName,
  deaths,
  kills,
  riotId: riotId_,
  member,
  reverse,
}) => {
  const riotId = riotId_ ?? member?.riotId ?? RiotId(GameName('undefined'), TagLine('undef'))

  return (
    <li
      className={cx(
        'grid items-center gap-2',
        reverse ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr_auto]',
      )}
    >
      <div className={cx('flex items-center gap-2', ['col-start-2 flex-row-reverse', reverse])}>
        {member !== undefined ? (
          <TeamRoleIconGold role={member.role} className="w-6" />
        ) : (
          <span className="w-6" />
        )}

        <CroppedChampionSquare
          key={championName}
          version={version}
          championId={championName}
          championName={ChampionId.unwrap(championName)}
          className="h-6 w-6"
        />

        <div>
          <span className="font-medium text-goldenrod">{GameName.unwrap(riotId.gameName)}</span>
          <span className="text-grey-500">#{TagLine.unwrap(riotId.tagLine)}</span>
        </div>

        {member?.isCaptain === true && (
          <Image
            src="/icons/crown-64.png"
            alt="Icône de capitaine"
            width={20}
            height={20}
            className="object-cover px-0.5 opacity-90"
          />
        )}
      </div>

      <span className={cx('row-start-1', ['col-start-2', !reverse])}>
        {kills} / {deaths} / {assists}
      </span>
    </li>
  )
}
