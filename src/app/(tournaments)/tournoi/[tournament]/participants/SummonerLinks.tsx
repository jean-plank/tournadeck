'use client'

import type { FloatingContext, UseInteractionsReturn } from '@floating-ui/react'
import {
  FloatingFocusManager,
  FloatingList,
  autoUpdate,
  flip,
  safePolygon,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
  useTypeahead,
} from '@floating-ui/react'
import { useRef, useState } from 'react'
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
  floating: UseSummonerLinksFloating<RE>
}

type UseSummonerLinksFloating<RE extends Element> = {
  context: FloatingContext<RE>
  isOpen: boolean
  activeIndex: number | null
  elementsRef: React.RefObject<(HTMLElement | null)[]>
  labelsRef: React.RefObject<(string | null)[]>
  setFloating: (node: HTMLElement | null) => void
  styles: React.CSSProperties
  props: Record<string, unknown>
  getItemProps: UseInteractionsReturn['getItemProps']
}

export function useSummonerLinks<RE extends Element>(): UseSummonerLinks<RE> {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const { refs, floatingStyles, context } = useFloating<RE>({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [shift({ padding: 8 }), flip()],
  })

  const elementsRef = useRef<(HTMLElement | null)[]>([])
  const labelsRef = useRef<(string | null)[]>([])

  function handleTypeaheadMatch(index: number | null): void {
    if (isOpen) {
      setActiveIndex(index)
    }
  }

  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
  })
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: handleTypeaheadMatch,
  })
  const hover = useHover(context, {
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  })
  const focus = useFocus(context)
  const role = useRole(context, { role: 'listbox' })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    listNav,
    typeahead,
    hover,
    focus,
    role,
  ])

  return {
    reference: {
      ref: refs.setReference,
      ...getReferenceProps(),
    },
    floating: {
      context,
      isOpen,
      activeIndex,
      elementsRef,
      labelsRef,
      setFloating: refs.setFloating,
      styles: floatingStyles,
      props: getFloatingProps(),
      getItemProps,
    },
  }
}

// ---

type SummonerLinksProps<RE extends Element> = UseSummonerLinksFloating<RE> & {
  riotId: RiotId
}

const urls = objectEntries({
  'La Quête.': theQuestUrl,
  'League of Graphs': leagueOfGraphsUrl,
  'OP.GG': opGGUrl,
})

export function SummonerLinks<RE extends Element>({
  context,
  isOpen,
  activeIndex,
  elementsRef,
  labelsRef,
  setFloating,
  styles,
  props,
  getItemProps,
  riotId,
}: SummonerLinksProps<RE>): React.ReactNode {
  if (contextMenuLayer === undefined) return null

  return createPortal(
    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
      <ul
        ref={setFloating}
        className={cx(
          'flex flex-col gap-2 bg-zinc-900 px-3 py-2 text-sm text-white shadow-even shadow-black transition-opacity duration-300',
          isOpen ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        style={styles}
        {...props}
      >
        <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
          {urls.map(([label, getUrl]) => {
            const url = getUrl(riotId)

            return (
              <Li key={label} activeIndex={activeIndex} getItemProps={getItemProps} label={label}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                  className="group flex items-center justify-between gap-3"
                >
                  <span className="border-b border-b-transparent group-hover:border-b-goldenrod">
                    {label}
                  </span>
                  <OpenInNew className="size-3.5" />
                </a>
              </Li>
            )
          })}
        </FloatingList>
      </ul>
    </FloatingFocusManager>,
    contextMenuLayer,
  )
}

type LiProps = {
  activeIndex: number | null
  getItemProps: UseInteractionsReturn['getItemProps']
  label: string
  children?: React.ReactNode
}

const Li: React.FC<LiProps> = ({ activeIndex, getItemProps, label, children }) => {
  const { ref, index } = useListItem({ label })

  const isActive = activeIndex === index

  return (
    <li ref={ref} tabIndex={isActive ? 0 : -1} {...getItemProps()}>
      {children}
    </li>
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
