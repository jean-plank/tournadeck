import { either, json } from 'fp-ts'
import type { Json } from 'fp-ts/Json'
import { pipe } from 'fp-ts/function'
import { useCallback } from 'react'

import { addGameData } from '../../../../../actions/addGameData'
import { GameDataPayload } from '../../../../../models/GameDataPayload'
import type { MatchId } from '../../../../../models/pocketBase/tables/match/MatchId'
import { decodeErrorString } from '../../../../../utils/ioTsUtils'

const gameData = 'gameData'

type Props = {
  matchId: MatchId
  handleCancelClick: () => void
}

export const MatchForm: React.FC<Props> = ({ matchId, handleCancelClick }) => {
  const formAction = useCallback(
    async (formData: FormData) => {
      try {
        const matchDataValue: Json = pipe(
          formData.get(gameData),
          either.fromNullable(`${gameData} was null`),
          either.chain(i =>
            typeof i === 'string'
              ? pipe(
                  json.parse(i),
                  either.mapLeft(() => 'Invalid json'),
                )
              : either.left(`${gameData} was not string`),
          ),
          either.chainFirst(i =>
            pipe(
              GameDataPayload.decoder.decode(i),
              either.mapLeft(decodeErrorString('LCUMatch')(i)),
            ),
          ),
          either.getOrElseW(e => {
            console.warn(e)
            throw Error(`Invalid ${gameData}`)
          }),
        )

        await addGameData(matchId, matchDataValue)

        handleCancelClick()
      } catch {
        alert('Erreur.')
      }
    },
    [handleCancelClick, matchId],
  )

  return (
    <form
      action={formAction}
      className="flex min-w-[416px] flex-col gap-3 rounded-lg border-2 border-goldenrod bg-white1 p-4"
    >
      <label className="flex flex-col gap-1">
        <span>JSON pour la partie :</span>

        <textarea
          name={gameData}
          autoFocus={true}
          className="w-full rounded-md border border-blue1 p-2 font-medium outline-none"
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-full border-2 border-goldenrod-bis px-3.5 py-1.5"
          onClick={handleCancelClick}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="rounded-full bg-goldenrod px-4 py-2 font-bold text-white hover:text-black"
        >
          Valider
        </button>
      </div>
    </form>
  )
}
