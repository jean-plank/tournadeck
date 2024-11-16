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
  useTransitionStyles,
} from '@floating-ui/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { cx } from '../../utils/cx'

let contextMenuLayer: Optional<HTMLDivElement> = undefined

export const ContextMenuLayer: React.FC = () => <div ref={onMount} />

function onMount(e: Nullable<HTMLDivElement>): void {
  contextMenuLayer = e ?? undefined
}

// ---

type UseContextMenu<RE extends Element> = {
  reference: {
    ref: (node: Nullable<RE>) => void
  } & Record<string, unknown>
  floating: UseContextMenuFloating
}

type UseContextMenuFloating = {
  isMounted: boolean
  setFloating: (node: Nullable<HTMLElement>) => void
  styles: React.CSSProperties
  props: Record<string, unknown>
}

export function useContextMenu<RE extends Element>(): UseContextMenu<RE> {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating<RE>({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [shift({ padding: 8 }), flip()],
  })

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, { duration: 300 })

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
      isMounted,
      setFloating: refs.setFloating,
      styles: {
        ...floatingStyles,
        ...transitionStyles,
      },
      props: getFloatingProps(),
    },
  }
}

// ---

type Props = UseContextMenuFloating & {
  className?: string
  children?: React.ReactNode
}

export const ContextMenu: React.FC<Props> = ({
  isMounted,
  setFloating,
  styles,
  props,
  className,
  children,
}) => {
  if (contextMenuLayer === undefined || !isMounted) return null

  return createPortal(
    <div
      ref={setFloating}
      className={cx(
        'z-30 whitespace-nowrap bg-zinc-900 px-2 py-1 text-sm text-wheat shadow-even shadow-black',
        className,
      )}
      style={styles}
      {...props}
    >
      {children}
    </div>,
    contextMenuLayer,
  )
}
