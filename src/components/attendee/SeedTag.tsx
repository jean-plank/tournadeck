import { cx } from '../../utils/cx'
import { Tooltip, useTooltip } from '../floating/Tooltip'

type Props = {
  seed: number
  withTooltip: boolean
  className?: string
}

export const SeedTag: React.FC<Props> = ({ seed, withTooltip, className }) => {
  const seedTooltip = useTooltip<HTMLDivElement>({ placement: 'top' })

  return (
    <>
      <div
        className={cx('rounded-b-xl bg-goldenrod px-px pb-px shadow-even shadow-black', className)}
        {...seedTooltip.reference}
      >
        <div className="rounded-b-xl border-x border-b border-white px-1 pb-0.5 font-lib-mono text-sm text-black">
          #{seed}
        </div>
      </div>
      {withTooltip && <Tooltip {...seedTooltip.floating}>Seed #{seed}</Tooltip>}
    </>
  )
}
