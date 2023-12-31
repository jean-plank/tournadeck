'use client'

import { number, ord, readonlyArray } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { useCallback, useRef } from 'react'

import { TeamRoleIcon } from '../../../../components/TeamRoleIcon'
import { usePocketBase } from '../../../../contexts/PocketBaseContext'
import { Dayjs } from '../../../../models/Dayjs'
import { TeamRole } from '../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../models/attendee/AttendeeWithRiotId'
import type { Tournament } from '../../../../models/pocketBase/tables/Tournament'
import { arrayGroupBy, partialRecord } from '../../../../utils/fpTsUtils'
import { AttendeeForm } from './AttendeeForm'
import { AttendeeTile } from './AttendeeTile'

const dateTimeFormat = 'dddd D MMMM YYYY, hh:mm'

const bySeed = pipe(
  number.Ord,
  ord.contramap((a: { seed: number }) => a.seed),
)

type Props = {
  tournament: Tournament
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

export const Attendees: React.FC<Props> = ({ tournament, attendees }) => {
  const { user } = usePocketBase()

  const dialog = useRef<HTMLDialogElement>(null)

  const handleSuscribeClick = useCallback((): void => {
    if (dialog.current !== null) dialog.current.showModal()
  }, [])

  const handleCancelClick = useCallback((): void => {
    if (dialog.current !== null) dialog.current.close()
  }, [])

  const onSuscribeOk = useCallback((): void => {
    if (dialog.current !== null) dialog.current.close()
  }, [])

  // TODO: check role is still open
  const alreadySubscribed =
    attendees.length < tournament.teamsCount * 5 &&
    user !== undefined &&
    attendees.find(a => a.user === user.id) !== undefined

  const grouped = pipe(
    attendees,
    arrayGroupBy(a => a.role),
    partialRecord.map(readonlyArray.sort(bySeed)),
  )

  return (
    <div className="flex flex-col items-start gap-5 text-gold">
      <div className="flex w-full flex-col items-center justify-center pt-6">
        <h1 className="font-friz text-6xl font-bold">{tournament.name}</h1>

        <div className="flex flex-row items-center gap-3 text-white">
          <span className="font-bold">{Dayjs(tournament.start).format(dateTimeFormat)}</span>
          <span>—</span>
          <span className="font-bold">{Dayjs(tournament.end).format(dateTimeFormat)}</span>
        </div>
      </div>

      {!alreadySubscribed && (
        <dialog ref={dialog} className="bg-transparent">
          <div className="flex flex-col items-end">
            <AttendeeForm
              tournament={tournament.id}
              onSubscribeOk={onSuscribeOk}
              avalaibleTeamRole={TeamRole.values.reduce(
                (acc: TeamRole[], v) =>
                  attendees.filter(p => p.role === v).length < tournament.teamsCount
                    ? [...acc, v]
                    : acc,
                [],
              )}
            />
            <button
              type="button"
              className="m-1 rounded bg-white1 px-1 text-xs text-gold"
              onClick={handleCancelClick}
            >
              Annuler
            </button>
          </div>
        </dialog>
      )}

      <div className="flex w-full flex-col items-center">
        <div className="flex flex-col items-center">
          {!alreadySubscribed && (
            <button
              type="button"
              onClick={handleSuscribeClick}
              className="my-2 rounded bg-gold px-8 py-2 text-3xl font-bold text-white"
            >
              S’inscrire
            </button>
          )}
          <h2 className="font-bold">
            Participants ({attendees.length} / {tournament.teamsCount * 5})
          </h2>
        </div>

        <div className="flex w-full flex-col items-start">
          {TeamRole.values.map(role => (
            <div className="flex w-full flex-row justify-start gap-2 pl-2 odd:bg-black" key={role}>
              <div className="flex min-h-[10rem] flex-col items-center justify-center">
                <TeamRoleIcon role={role} className="h-16 w-16" />
                <div>
                  {grouped[role]?.length ?? 0}/{tournament.teamsCount}
                </div>
              </div>
              {grouped[role]?.map(p => <AttendeeTile key={p.id} attendee={p} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
