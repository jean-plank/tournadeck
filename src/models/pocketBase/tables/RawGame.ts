import type { Json } from 'fp-ts/Json'
import type { Newtype } from 'newtype-ts'

import type { GameId } from '../../riot/GameId'
import type { JsonField, NumberField, PbBaseModel, PbInput, PbOutput } from '../pbModels'

export type RawGame = PbOutput<PbRawGame>
export type RawGameInput = PbInput<PbRawGame>

export type PbRawGame = PbBaseModel<
  RawGameId,
  {
    gameId: NumberField<GameId, 'required'>
    value: JsonField<Json, 'required'>
  }
>

export type RawGameId = Newtype<{ readonly RawMatchId: unique symbol }, string>
