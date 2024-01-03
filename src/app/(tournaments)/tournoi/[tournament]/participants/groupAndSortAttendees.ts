import { number, ord, readonlyNonEmptyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import type { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { array, partialRecord } from '../../../../../utils/fpTsUtils'

const bySeed = pipe(
  number.Ord,
  ord.contramap((a: { seed: number }) => (a.seed === 0 ? Infinity : a.seed)),
)

export function groupAndSortAttendees(
  attendees: ReadonlyArray<AttendeeWithRiotId>,
): Partial<ReadonlyRecord<TeamRole, NonEmptyArray<AttendeeWithRiotId>>> {
  return pipe(
    attendees,
    array.groupBy(a => a.role),
    partialRecord.map(as =>
      as !== undefined ? pipe(as, readonlyNonEmptyArray.sort(bySeed)) : undefined,
    ),
  )
}
