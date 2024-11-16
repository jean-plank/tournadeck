import { Tooltip, useTooltip } from '../floating/Tooltip'

type Props = {
  seed: number
  withTooltip: boolean
}

export const SeedTag: React.FC<Props> = ({ seed, withTooltip }) => {
  const seedTooltip = useTooltip<HTMLDivElement>({ placement: 'top' })

  return (
    <>
      <div
        className="self-start justify-self-end rounded-b-xl bg-goldenrod px-px pb-px shadow-even shadow-black area-1"
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
