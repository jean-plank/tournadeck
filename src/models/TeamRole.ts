import { createEnum } from '../utils/createEnum'

type TeamRole = typeof e.T

const e = createEnum('top', 'jun', 'mid', 'bot', 'sup')

const label: ReadonlyRecord<TeamRole, string> = {
  top: 'Haut',
  jun: 'Jungle',
  mid: 'Milieu',
  bot: 'Bas',
  sup: 'Support',
}

const TeamRole = { ...e, label }

export { TeamRole }
