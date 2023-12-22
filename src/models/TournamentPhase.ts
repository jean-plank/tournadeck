/**
 * 1. `created`: enrolment is open
 * 2. `teamDraft`: enrolment is closed, teams are being created
 * 3. `matches`: teams are (theoretically) complete, matches are scheduled and being played
 * 4. `finished`: tournament is over, it is archived and kept for consultation
 */
type TournamentPhase = (typeof values)[number]

const values = ['created', 'teamDraft', 'matches', 'finished'] as const

const defaultPhase: TournamentPhase = 'created'

const TournamentPhase = { values, defaultPhase }

export { TournamentPhase }
