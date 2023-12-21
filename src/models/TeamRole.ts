type TeamRole = (typeof values)[number]

const values = ['top', 'jun', 'mid', 'bot', 'sup'] as const

const label: Record<TeamRole, string> = {
  top: 'Haut',
  jun: 'Jungle',
  mid: 'Milieu',
  bot: 'Bas',
  sup: 'Support',
}

const TeamRole = { values, label }

export { TeamRole }
