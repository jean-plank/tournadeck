import { createEnum } from '../utils/createEnum'

type LevelWithSilent = typeof LevelWithSilent.T

const LevelWithSilent = createEnum('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')

export { LevelWithSilent }
