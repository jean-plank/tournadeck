import Image from 'next/image'
import type { HTMLAttributes } from 'react'
import { createElement, forwardRef } from 'react'

import type { ChampionId } from '../models/riot/ChampionId'
import type { DDragonVersion } from '../models/riot/DDragonVersion'
import { DDragonUtils } from '../utils/DDragonUtils'
import { cx } from '../utils/cx'

type Props<A extends HTMLTag> = {
  version: DDragonVersion
  championId: ChampionId
  championName: string
  width: number
  height: number
  as?: A
  isDraggable?: boolean
  children?: React.ReactNode
} & HTMLAttributes<ExtractElement<A>>

export const CroppedChampionSquare = forwardRef(function <A extends HTMLTag>(
  {
    version,
    championId,
    championName,
    width,
    height,
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
    <Image
      src={DDragonUtils.champion.square(version, championId)}
      alt={`Icône de ${championName}`}
      width={width}
      height={height}
      draggable={isDraggable}
      className="m-[-6%] w-[112%] max-w-none"
    />,
    children,
  )
}) as <A extends HTMLTag = 'div'>(
  props: React.PropsWithoutRef<Props<A>> & React.RefAttributes<ExtractElement<A>>,
) => React.ReactElement | null

type HTMLTag = keyof React.ReactHTML

type ExtractElement<A extends HTMLTag> = React.ReactHTML[A] extends React.DetailedHTMLFactory<
  React.HTMLAttributes<unknown>,
  infer E
>
  ? E
  : never
