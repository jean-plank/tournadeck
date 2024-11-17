import { readonlyNonEmptyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import type { TeamRole } from '../models/TeamRole'
import type { AttendeeWithRiotId } from '../models/attendee/AttendeeWithRiotId'
import { Attendee } from '../models/pocketBase/tables/Attendee'
import { array, partialRecord } from '../utils/fpTsUtils'

export function groupAndSortAttendees(
  attendees: ReadonlyArray<AttendeeWithRiotId>,
): Partial<ReadonlyRecord<TeamRole, NonEmptyArray<AttendeeWithRiotId>>> {
  return pipe(
    attendees,
    array.groupBy(a => a.role),
    partialRecord.map(as =>
      as !== undefined ? pipe(as, readonlyNonEmptyArray.sort(Attendee.bySeed)) : undefined,
    ),
  )
}
