import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'
import { readonlyArray } from 'fp-ts'
import type { Codec } from 'io-ts/Codec'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'
import { useCallback, useState } from 'react'

import { TeamRoleIconGold } from '../../../../../components/TeamRoleIcon'
import { AttendeeTile } from '../../../../../components/attendee/AttendeeTile'
import { SeedTag } from '../../../../../components/attendee/SeedTag'
import { ContextMenu } from '../../../../../components/floating/ContextMenu'
import { SettingsSharp } from '../../../../../components/svgs/icons'
import { TeamRole } from '../../../../../models/TeamRole'
import type { AttendeeWithRiotId } from '../../../../../models/attendee/AttendeeWithRiotId'
import { cx } from '../../../../../utils/cx'

export const shouldDisplayAvatarRating = true
export const captainShouldDisplayPrice = false

export type MercatoValue = Seed | TeamRole
export type Seed = number

const mercatoValueCodec: Codec<unknown, MercatoValue, MercatoValue> = C.make(
  D.union(D.number, TeamRole.decoder),
  E.id<MercatoValue>(),
)

export const MercatoValue = { codec: mercatoValueCodec }

type MercatoPanelProps = {
  tournamentTeamsCount: number
  mercatoValue: Nullable<MercatoValue>
  setMercatoValue: React.Dispatch<React.SetStateAction<Nullable<MercatoValue>>>
  attendees: ReadonlyArray<AttendeeWithRiotId>
}

export const MercatoPanel: React.FC<MercatoPanelProps> = ({
  tournamentTeamsCount,
  mercatoValue,
  setMercatoValue,
  attendees,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    placement: 'bottom-start',
    open: isOpen || mercatoValue === null,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), shift({ padding: 8 }), flip()],
  })

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, { duration: 300 })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role_ = useRole(context, { role: 'listbox' })

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role_])

  const handleClick = useCallback(
    (value: MercatoValue) => () => {
      setMercatoValue(prev => (prev === value ? null : value))
      setIsOpen(false)
    },
    [setMercatoValue],
  )

  return (
    <div className="flex min-w-[281px] flex-col gap-4 overflow-y-auto border-l border-goldenrod bg-blue1 px-4 pb-14 pt-4">
      <div className="grid grid-cols-[1.5rem_1fr_1.5rem] items-start justify-items-center gap-4">
        <button ref={refs.setReference} type="button" {...getReferenceProps()}>
          <SettingsSharp className="size-6" />
        </button>

        {mercatoValue !== null &&
          (typeof mercatoValue === 'number' ? (
            <SeedTag seed={mercatoValue} withTooltip={false} className="mb-2" />
          ) : (
            <span className="bg-dark-red shadow-even shadow-burgundy/50">
              <TeamRoleIconGold
                role={mercatoValue}
                className={mercatoValue === 'sup' ? 'm-0.5 size-7' : 'size-8'}
              />
            </span>
          ))}
      </div>

      <ContextMenu
        isMounted={isMounted}
        setFloating={refs.setFloating}
        styles={{ ...floatingStyles, ...transitionStyles }}
        props={getFloatingProps()}
        className="grid grid-cols-[auto_auto] gap-y-1.5 py-2 pt-2.5 font-medium"
      >
        <h3 className="col-span-2 justify-self-center font-bold">Enchères</h3>

        <ul className="flex flex-col justify-center gap-1 pr-2">
          {Array.from({ length: tournamentTeamsCount }).map((_, i) => {
            const seed = i + 1

            return (
              <MenuOption key={seed} selected={seed === mercatoValue} onClick={handleClick(seed)}>
                Seed #{seed}
              </MenuOption>
            )
          })}
        </ul>

        <ul className="flex flex-col justify-center gap-1 border-l border-goldenrod pl-2">
          {TeamRole.values.map(role => (
            <MenuOption key={role} selected={role === mercatoValue} onClick={handleClick(role)}>
              {TeamRole.label[role]}
            </MenuOption>
          ))}
        </ul>
      </ContextMenu>

      {readonlyArray.isNonEmpty(attendees) && (
        <ul
          className={cx('grid grid-cols-[auto] gap-4', {
            'xl:grid-cols-[auto_auto]': attendees.length > 1,
          })}
        >
          {attendees.map(attendee => (
            <AttendeeTile
              key={attendee.id}
              {...{ attendee, shouldDisplayAvatarRating, captainShouldDisplayPrice }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

type MenuOptionProps = {
  selected: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
}

const MenuOption: React.FC<MenuOptionProps> = ({ selected, onClick, children }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'w-full rounded px-2 py-0.5 text-center',
        selected ? 'bg-green1 text-white' : 'hover:bg-goldenrod hover:text-black',
      )}
    >
      {children}
    </button>
  </li>
)
