'use client'

import {
  autoUpdate,
  flip,
  safePolygon,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { OpenInNew } from '../../../../../components/svgs/icons'
import { constants } from '../../../../../config/constants'
import { RiotId } from '../../../../../models/riot/RiotId'
import { cx } from '../../../../../utils/cx'
import { objectEntries } from '../../../../../utils/fpTsUtils'

let contextMenuLayer: Optional<HTMLDivElement> = undefined

export const ContextMenuLayer: React.FC = () => <div ref={onMount} />

function onMount(e: HTMLDivElement | null): void {
  contextMenuLayer = e ?? undefined
}

// ---

type UseSummonerLinks<RE extends Element> = {
  reference: {
    ref: (node: RE | null) => void
  } & Record<string, unknown>
  floating: UseSummonerLinksFloating
}

type UseSummonerLinksFloating = {
  isOpen: boolean
  setFloating: (node: HTMLElement | null) => void
  styles: React.CSSProperties
  props: Record<string, unknown>
}

export function useSummonerLinks<RE extends Element>(): UseSummonerLinks<RE> {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating<RE>({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [shift({ padding: 8 }), flip()],
  })

  const hover = useHover(context, {
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  })
  const role = useRole(context, { role: 'listbox' })

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role])

  return {
    reference: {
      ref: refs.setReference,
      ...getReferenceProps(),
    },
    floating: {
      isOpen,
      setFloating: refs.setFloating,
      styles: floatingStyles,
      props: getFloatingProps(),
    },
  }
}

// ---

type Props = UseSummonerLinksFloating & {
  riotId: RiotId
}

const urls = objectEntries({
  'La Quête.': theQuestUrl,
  'League of Graphs': leagueOfGraphsUrl,
  'OP.GG': opGGUrl,
})

export const SummonerLinks: React.FC<Props> = ({ isOpen, setFloating, styles, props, riotId }) => {
  if (contextMenuLayer === undefined) return null

  return createPortal(
    <ul
      ref={setFloating}
      className={cx(
        'flex flex-col gap-2 items-center bg-zinc-900 p-2 text-sm text-white shadow-even shadow-black transition-all duration-300',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0',
      )}
      style={styles}
      {...props}
    >
      {urls.map(([label, getUrl]) => {
        const url = getUrl(riotId)

        return (
          <li key={label}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-2"
            >
              <OpenInNew className="invisible size-3.5" />
              <span className="border-b border-b-transparent transition-all duration-100 group-hover:border-b-goldenrod">
                {label}
              </span>
              <OpenInNew className="invisible size-3.5 opacity-0 transition-all duration-100 group-hover:visible group-hover:opacity-100" />
            </a>
          </li>
        )
      })}
    </ul>,
    contextMenuLayer,
  )
}

const platform = constants.platform.toLowerCase()

function theQuestUrl(riotId: RiotId): string {
  return `https://laquete.blbl.ch/${platform}/${RiotId.stringify('-')(riotId)}`
}

function leagueOfGraphsUrl(riotId: RiotId): string {
  return `https://www.leagueofgraphs.com/summoner/${platform}/${RiotId.stringify('-')(riotId)}`
}

function opGGUrl(riotId: RiotId): string {
  return `https://www.op.gg/summoners/${platform}/${RiotId.stringify('-')(riotId)}`
}
