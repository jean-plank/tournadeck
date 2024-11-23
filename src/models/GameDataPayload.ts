import * as D from 'io-ts/Decoder'

import { GameId } from './riot/GameId'
import { LCUMatch } from './riot/LCUMatch'

type GameDataPayload = D.TypeOf<typeof decoder>

const decoder = D.union(GameId.codec, LCUMatch.decoder)

const GameDataPayload = { decoder }

export { GameDataPayload }
