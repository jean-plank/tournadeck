import type { TeamRole } from '../models/TeamRole'
import { cx } from '../utils/cx'
import { teamRoleIcons } from './svgs/teamRoleIcons'

type Props = {
  role: TeamRole
  className?: string
}

export const TeamRoleIcon: React.FC<Props> = ({ role, className }) => {
  const Role = teamRoleIcons[role]

  return <Role className={cx('text-[#eab30a]', className)} secondaryClassName="text-[#20054d]/50" />
}
