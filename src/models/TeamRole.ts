import { record } from 'fp-ts'

type TeamRole = 'top' | 'jun' | 'mid' | 'bot' | 'sup'

const label: Record<TeamRole, string> = {
  top: 'Top',
  jun: 'Jungle',
  mid: 'Midlane',
  bot: 'Botlane',
  sup: 'Support',
}

const values = record.keys(label).sort((a, b) => {
  const order = { top: 1, jun: 2, mid: 3, bot: 4, sup: 5 }
  return order[a] - order[b]
})

const TeamRole = { label, values }

export { TeamRole }
