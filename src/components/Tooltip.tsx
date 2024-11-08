'use client'

import type { Placement } from '@floating-ui/react'
import {
  arrow as arrow_,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cx } from '../utils/cx'
import { CaretUpSharpCropped } from './svgs/icons'

let tooltipLayer: Optional<HTMLDivElement> = undefined

// ---

type UseTooltipOptions = {
  placement?: Placement
}

type UseTooltip<RE extends Element, PE extends Element | false = false> = PE extends false
  ? UseTooltipBase<RE>
  : UseTooltipBase<RE> & {
      positionReference: {
        ref: (node: PE | null) => void
      }
    }

type UseTooltipBase<RE extends Element> = {
  reference: UseTooltipReference<RE>
  floating: UseTooltipFloating
}

export type UseTooltipReference<RE extends Element> = {
  ref: (node: RE | null) => void
} & Record<string, unknown>

type UseTooltipFloating = {
  placement: Placement
  isOpen: boolean
  setFloating: (node: ContainerElement | null) => void
  styles: React.CSSProperties
  props: Record<string, unknown>
  arrow: {
    ref: React.RefObject<ArrowElement | null>
    styles: Optional<{
      left: Optional<React.CSSProperties['left']>
      top: Optional<React.CSSProperties['top']>
    }>
  }
}

type ContainerElement = HTMLDivElement
type ArrowElement = HTMLDivElement

export function useTooltip<RE extends Element, PE extends Element | false = false>({
  placement,
}: UseTooltipOptions = {}): UseTooltip<RE, PE> {
  const arrowRef = useRef<ArrowElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  const { refs, context, floatingStyles, middlewareData } = useFloating<RE>({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [arrow_({ element: arrowRef }), offset(7), shift({ padding: 8 }), flip()],
  })

  const hover = useHover(context)
  const focus = useFocus(context)
  const role = useRole(context, { role: 'tooltip' })

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, role])

  useFloating({ onOpenChange: setIsOpen })

  return {
    reference: {
      ref: refs.setReference,
      ...getReferenceProps(),
    },
    positionReference: {
      ref: refs.setPositionReference,
    },
    floating: {
      placement: context.placement,
      isOpen,
      setFloating: refs.setFloating,
      styles: floatingStyles,
      props: getFloatingProps(),
      arrow: {
        ref: arrowRef,
        styles:
          middlewareData.arrow !== undefined
            ? {
                left: middlewareData.arrow.x,
                top: middlewareData.arrow.y,
              }
            : undefined,
      },
    },
  } as UseTooltip<RE, PE>
}

// ---

type Props = UseTooltipFloating & {
  alwaysVisible?: boolean
  className?: string
  children?: React.ReactNode
}

export const Tooltip: React.FC<Props> = ({
  placement,
  isOpen,
  setFloating,
  styles,
  props,
  arrow,
  alwaysVisible = false,
  className,
  children,
}) => {
  if (tooltipLayer === undefined) return null

  const isTop = placement.startsWith('top')
  const isBottom = placement.startsWith('bottom')
  const isLeft = placement.startsWith('left')
  const isRight = placement.startsWith('right')

  return createPortal(
    <div
      ref={setFloating}
      className={cx(
        'z-40 whitespace-nowrap border border-brown bg-zinc-900 px-2 py-1 text-sm text-wheat shadow-even shadow-black transition-opacity duration-300',
        alwaysVisible || isOpen ? 'visible opacity-100' : 'invisible opacity-0',
        className,
      )}
      style={styles}
      {...props}
    >
      {children}
      <div
        ref={arrow.ref}
        className={cx(
          'absolute h-1.5 w-2.5',
          ['-bottom-1.5', isTop],
          ['-top-1.5', isBottom],
          ['-right-2', isLeft],
          ['-left-2', isRight],
        )}
        style={arrow.styles}
      >
        <CaretUpSharpCropped
          className={cx(
            'text-brown',
            ['rotate-180', isTop],
            ['rotate-0', isBottom],
            ['rotate-90', isLeft],
            ['-rotate-90', isRight],
          )}
        />
      </div>
    </div>,
    tooltipLayer,
  )
}

// ---

export const TooltipLayer: React.FC = () => <div ref={onMount} />

function onMount(e: HTMLDivElement | null): void {
  tooltipLayer = e ?? undefined
}
