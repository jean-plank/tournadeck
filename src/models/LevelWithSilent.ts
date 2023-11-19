import type { Decoder } from 'io-ts/lib/Decoder'
import type { LevelWithSilent as PinoLevelWithSilent } from 'pino'

import { createEnum } from '@/utils/createEnum'

type LevelWithSilent = PinoLevelWithSilent

const LevelWithSilent = createEnum('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')

// Ensure that createEnum uses valid PinoLevelWithSilent values
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const decoder: Decoder<unknown, PinoLevelWithSilent> = LevelWithSilent.decoder

export { LevelWithSilent }
