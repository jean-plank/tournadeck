import { readonlyRecord } from 'fp-ts'

type TeamRole = 'top' | 'jun' | 'mid' | 'bot' | 'sup'

const label: Record<TeamRole, string> = {
  top: 'Top',
  jun: 'Jungle',
  mid: 'Midlane',
  bot: 'Botlane',
  sup: 'Support',
}
const values = readonlyRecord.keys(label)
const TeamRole = { label, values }

export { TeamRole }
