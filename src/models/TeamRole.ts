type TeamRole = (typeof values)[number]

const values = ['top', 'jun', 'mid', 'bot', 'sup'] as const

const label: Record<TeamRole, string> = {
  top: 'Top',
  jun: 'Jungle',
  mid: 'Midlane',
  bot: 'Botlane',
  sup: 'Support',
}

const TeamRole = { label, values }

export { TeamRole }
