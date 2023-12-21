import Image from 'next/image'

import type { TeamRole } from '../models/TeamRole'

type Props = {
  role: TeamRole
  className?: string
}
export const TeamRoleIcon: React.FC<Props> = ({ role, className }) => (
  <Image
    alt={`${role}-icon`}
    className={className}
    width={200}
    height={200}
    src={`/icons/teamRoles/${role}.svg`}
  />
)
