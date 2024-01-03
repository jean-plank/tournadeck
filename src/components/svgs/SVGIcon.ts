import type { SVGProps } from 'react'
import type { Except } from 'type-fest'

export type SVGIcon = React.FC<SVGIconProps>

export type SVGIconProps = Except<SVGProps<SVGSVGElement>, 'children'>
