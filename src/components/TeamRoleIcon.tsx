import Image from 'next/image'

import { TeamRole } from '../models/TeamRole'

type Props = {
  role: TeamRole
  className?: string
}

export const TeamRoleIcon: React.FC<Props> = ({ role, className }) => (
  <Image
    alt={`Icône ${TeamRole.label[role]}`}
    className={className}
    width={200}
    height={200}
    src={`/icons/teamRoles/${role}.svg`}
  />
)
