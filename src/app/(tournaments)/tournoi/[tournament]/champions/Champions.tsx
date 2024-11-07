'use client'

import { random, readonlyArray } from 'fp-ts'
import { useCallback, useMemo, useState } from 'react'
import type { Merge } from 'type-fest'

import { CroppedChampionSquare } from '../../../../../components/CroppedChampionSquare'
import { OpenInNew } from '../../../../../components/svgs/icons'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import type { StaticData } from '../../../../../models/theQuest/staticData/StaticData'
import type { StaticDataChampion } from '../../../../../models/theQuest/staticData/StaticDataChampion'
import { cleanUTF8ToASCII } from '../../../../../utils/stringUtils'
import { SearchChampion } from './SearchChampion'

export type Props = Merge<
  {
    tournamentId: TournamentId
    staticData: StaticData
    draftlolLink: Optional<string>
  },
  PartionedChampions
>

export type PartionedChampions = {
  stillAvailable: ReadonlyArray<StaticDataChampion>
  alreadyPlayed: ReadonlyArray<StaticDataChampion>
}

export const Champions: React.FC<Props> = ({
  tournamentId,
  staticData,
  stillAvailable,
  alreadyPlayed,
  draftlolLink,
}) => {
  const [search, setSearch] = useState<Optional<string>>(undefined)

  const filteredStillAvailable = stillAvailable.filter(filterChampion(search))

  const filteredAlreadyPlayed = alreadyPlayed.filter(filterChampion(search))

  const randomChampion = useMemo((): Optional<() => string> => {
    if (!readonlyArray.isNonEmpty(stillAvailable)) return undefined

    return () => random.randomElem(stillAvailable)().name
  }, [stillAvailable])

  const copyAlreadyPlayed = useCallback(() => {
    navigator.clipboard.writeText(
      `yarn draftlolLink ${tournamentId} '${JSON.stringify(alreadyPlayed.map(c => c.id))}'`,
    )
  }, [alreadyPlayed, tournamentId])

  const totalChampionsCount = stillAvailable.length + alreadyPlayed.length

  return (
    <div className="flex flex-col gap-8 px-4 py-8">
      <SearchChampion
        searchCount={filteredStillAvailable.length + filteredAlreadyPlayed.length}
        randomChampion={randomChampion}
        initialSearch={search}
        onChange={setSearch}
        className="self-center"
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-bold">Champions disponibles :</h2>
          <span>
            {filteredStillAvailable.length} / {totalChampionsCount}
          </span>
        </div>

        <ul className="flex flex-wrap gap-1">
          {filteredStillAvailable.map(c => (
            <CroppedChampionSquare
              key={c.key}
              version={staticData.version}
              championId={c.id}
              championName={c.name}
              as="li"
              className="size-12"
            />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-bold">Champions déjà joués :</h2>
          <span>
            {filteredAlreadyPlayed.length} / {totalChampionsCount}
          </span>
        </div>

        <ul className="flex flex-wrap gap-1">
          {filteredAlreadyPlayed.map(c => (
            <CroppedChampionSquare
              key={c.key}
              version={staticData.version}
              championId={c.id}
              championName={c.name}
              as="li"
              className="relative size-12"
            >
              <span className="absolute top-[calc(100%_-_2px)] w-20 origin-left -rotate-45 border-t-4 border-red-500 shadow-even shadow-black" />
            </CroppedChampionSquare>
          ))}
        </ul>
      </div>

      {draftlolLink !== undefined && (
        <div className="flex items-center gap-4">
          <span className="font-bold">Organisateurs seulement :</span>

          <a
            href={draftlolLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 underline"
          >
            <span>Créer un salon sur Draftlol</span>
            <OpenInNew className="h-4" />
          </a>

          <button type="button" className="border border-white" onClick={copyAlreadyPlayed}>
            Copier la liste des champions déjà joués
          </button>
        </div>
      )}
    </div>
  )
}

const filterChampion =
  (search: Optional<string>) =>
  (c: StaticDataChampion): boolean =>
    search === undefined || cleanChampionName(c.name).includes(cleanChampionName(search))

const nonAZ = /[^a-z]/g

function cleanChampionName(name: string): string {
  return cleanUTF8ToASCII(name).toLowerCase().replaceAll(nonAZ, '')
}
