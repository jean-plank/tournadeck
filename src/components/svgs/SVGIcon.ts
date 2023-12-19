import type { SVGProps } from 'react'
import type { Except } from 'type-fest'

export type SVGIcon = React.FC<Except<SVGProps<SVGSVGElement>, 'children'>>
