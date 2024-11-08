'use client'

import type { Placement } from '@popperjs/core'
import { readonlyNonEmptyArray } from 'fp-ts'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { DayjsDuration } from '../../models/Dayjs'
import { cx } from '../../utils/cx'
import { CaretUpSharpCropped } from '../svgs/icons'
import type { ReactPopperParams } from './useVisiblePopper'
import { useVisiblePopper } from './useVisiblePopper'

let tooltipLayer: Optional<HTMLDivElement> = undefined

type Props = {
  hoverRef: React.RefObject<Element | null> | NonEmptyArray<React.RefObject<Element | null>>
  /**
   * Place the tooltip from this element.
   * @default hoverRef or NonEmptyArray.head(hoverRef)
   */
  placementRef?: React.RefObject<Element | null>
  /**
   * Time spent open by the tooltip after the user navigates away from it / the hover (tablet).
   */
  openedDuration?: DayjsDuration
  /**
   * @deault 'bottom"
   */
  placement?: Placement
  alwaysVisible?: boolean
  /**
   * Calls `hideTooltip` when changed to `true`
   */
  shouldHide?: boolean
  className?: string
  children?: React.ReactNode
}

export const Tooltip: React.FC<Props> = ({
  hoverRef: hoverRef_,
  placementRef: maybePlacementRef,
  openedDuration = DayjsDuration({ seconds: 3 }),
  placement = 'bottom',
  alwaysVisible = false,
  shouldHide,
  className,
  children,
}) => {
  const hoverRefs_ = isArray(hoverRef_) ? hoverRef_ : readonlyNonEmptyArray.of(hoverRef_)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hoverRefs = useMemo(() => hoverRefs_, hoverRefs_)
  const placementRef_ = maybePlacementRef ?? hoverRefs[0]

  const [shouldDisplay_, setShouldDisplay_] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)

  const shouldDisplay = alwaysVisible || shouldDisplay_

  const [eventListenersEnabled, setEventListenersEnabled] = useState(false)
  const options = useMemo(
    (): ReactPopperParams[2] => ({
      placement,
      modifiers: [
        { name: 'arrow', options: { element: arrowRef.current } },
        { name: 'offset', options: { offset: [0, 7] } },
        { name: 'preventOverflow', options: { padding: 8 } },
        // { name: 'flip', options: { padding: 8 } },
        { name: 'eventListeners', enabled: eventListenersEnabled },
      ],
    }),
    [eventListenersEnabled, placement],
  )
  const { styles, attributes } = useVisiblePopper(
    shouldDisplay,
    placementRef_.current,
    tooltipRef.current,
    options,
  )

  const timer = useRef<number>(undefined)

  const hideTooltip = useCallback(() => {
    window.clearTimeout(timer.current)
    setEventListenersEnabled(false)
    setShouldDisplay_(false)
  }, [])

  // Calls `hideTooltip` when changed to `true`
  useEffect(() => {
    if (shouldHide === true) hideTooltip()
  }, [hideTooltip, shouldHide])

  /**
   * Function that adds 'click' and 'mouseover/mouseleave' event listeners on 'hoverRef'.
   * Those listeners will mutate `shouldDisplayRef` inner value to control whether or not the tooltip should be displayed.
   */
  const setupHoverClickListeners = useCallback(() => {
    const hovers = hoverRefs.map(r => r.current)

    function showTooltip(): void {
      if (hovers.every(h => h === null)) return
      window.clearTimeout(timer.current)
      setEventListenersEnabled(true)
      setShouldDisplay_(true)
    }

    function clickTooltip(): void {
      showTooltip()

      // And hide it afterwards.
      timer.current = window.setTimeout(() => {
        hideTooltip()
      }, openedDuration.asMilliseconds())
    }

    hovers.forEach(hover => {
      if (hover === null) return

      // React to hover in / out for desktop users.
      hover.addEventListener('mouseover', showTooltip, true)
      hover.addEventListener('mouseleave', hideTooltip, true)

      // React to click / tap for tablet users.
      hover.addEventListener('click', clickTooltip, true)
    })

    return () => {
      window.clearTimeout(timer.current)
      hovers.forEach(hover => {
        if (hover === null) return

        hover.removeEventListener('click', clickTooltip, true)
        hover.removeEventListener('mouseover', showTooltip, true)
        hover.removeEventListener('mouseleave', hideTooltip, true)
      })
    }
  }, [hideTooltip, hoverRefs, openedDuration])

  // Set hover / click listeners to display or hide the tooltip.
  useEffect(setupHoverClickListeners, [setupHoverClickListeners])

  if (tooltipLayer === undefined) return null

  return createPortal(
    <div
      ref={tooltipRef}
      className={cx(
        'group z-40 whitespace-nowrap border border-brown bg-zinc-900 px-2 py-1 text-sm text-wheat shadow-even shadow-black transition-opacity duration-300',
        shouldDisplay ? 'visible opacity-100' : 'invisible opacity-0',
        className,
      )}
      style={styles['popper']}
      {...attributes['popper']}
    >
      {children}
      <div
        ref={arrowRef}
        className="h-1.5 w-2.5 group-data-popper-top:-bottom-1.5 group-data-popper-bottom:-top-1.5 group-data-popper-left:-right-2 group-data-popper-right:-left-2"
        style={styles['arrow']}
      >
        <CaretUpSharpCropped
          className={cx(
            'text-brown group-data-popper-top:rotate-180',
            ['group-data-popper-bottom:rotate-0', placement.startsWith('top')],
            [
              'group-data-popper-left:rotate-90 group-data-popper-right:-rotate-90',
              placement.startsWith('right'),
            ],
            [
              'group-data-popper-left:rotate-90 group-data-popper-right:-rotate-90',
              placement.startsWith('left'),
            ],
          )}
        />
      </div>
    </div>,
    tooltipLayer,
  )
}

const isArray = Array.isArray as unknown as <A>(a: A | NonEmptyArray<A>) => a is NonEmptyArray<A>

export const TooltipLayer: React.FC = () => <div ref={onMount} />

function onMount(e: HTMLDivElement | null): void {
  tooltipLayer = e ?? undefined
}
