import type { JSX } from 'react'
import { createElement, forwardRef } from 'react'

import type { ChampionId } from '../models/riot/ChampionId'
import type { DDragonVersion } from '../models/riot/DDragonVersion'
import { DDragonUtils } from '../utils/DDragonUtils'
import { cx } from '../utils/cx'

type Props<A extends HTMLTag> = {
  version: DDragonVersion
  championId: ChampionId
  championName: string
  as?: A
  isDraggable?: boolean
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<A>

export const CroppedChampionSquare = forwardRef(function <A extends HTMLTag>(
  {
    version,
    championId,
    championName,
    as = 'div' as A,
    isDraggable,
    className,
    children,
    ...props
  }: Props<A>,
  ref: React.ForwardedRef<ExtractElement<A>>,
) {
  return createElement(
    as,
    { ...props, ref, className: cx('overflow-hidden', className) },
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={DDragonUtils.champion.square(version, championId)}
      alt={`Icône de ${championName}`}
      draggable={isDraggable}
      className="m-[-6%] w-[112%] max-w-none"
    />,
    children,
  )
}) as <A extends HTMLTag = 'div'>(
  props: Props<A> & React.RefAttributes<ExtractElement<A>>,
) => React.ReactElement

type HTMLTag = keyof JSX.IntrinsicElements

type ExtractElement<A extends HTMLTag> =
  JSX.IntrinsicElements[A] extends React.DetailedHTMLProps<React.HTMLAttributes<unknown>, infer E>
    ? E
    : never
