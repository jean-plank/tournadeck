import type { TeamRole } from '../models/TeamRole'
import { cx } from '../utils/cx'
import { teamRoleIcons } from './svgs/teamRoleIcons'

type Props = {
  role: TeamRole
  className?: string
  secondaryClassName?: string
}

export const TeamRoleIcon: React.FC<Props> = ({ role, className, secondaryClassName }) => {
  const Role = teamRoleIcons[role]

  return <Role className={className} secondaryClassName={secondaryClassName} />
}

export const TeamRoleIconGold: React.FC<Props> = ({ role, className, secondaryClassName }) => (
  <TeamRoleIcon
    role={role}
    className={cx('text-[#c79f49]', className)}
    secondaryClassName={cx('text-[#fefcf7]/50', secondaryClassName)}
  />
)
