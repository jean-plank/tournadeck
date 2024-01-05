'use client'

import { random, readonlyArray } from 'fp-ts'
import { useMemo, useState } from 'react'
import type { Merge } from 'type-fest'

import type { ViewTournament } from '../../../../../actions/viewTournament'
import { CroppedChampionSquare } from '../../../../../components/CroppedChampionSquare'
import type { StaticDataChampion } from '../../../../../models/theQuest/staticData/StaticDataChampion'
import { cleanUTF8ToASCII } from '../../../../../utils/stringUtils'
import { SearchChampion } from './SearchChampion'

export type GetTournament = Merge<ViewTournament, PartionedChampions>

export type PartionedChampions = {
  stillAvailable: ReadonlyArray<StaticDataChampion>
  alreadyPlayed: ReadonlyArray<StaticDataChampion>
}

export const Champions: React.FC<GetTournament> = ({
  staticData,
  stillAvailable,
  alreadyPlayed,
}) => {
  const [search, setSearch] = useState<Optional<string>>(undefined)

  const filteredStillAvailable = stillAvailable.filter(filterChampion(search))

  const filteredAlreadyPlayed = alreadyPlayed.filter(filterChampion(search))

  const randomChampion = useMemo((): Optional<() => string> => {
    if (!readonlyArray.isNonEmpty(stillAvailable)) return undefined

    return () => random.randomElem(stillAvailable)().name
  }, [stillAvailable])

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
        <h2 className="font-bold">Champions disponibles :</h2>

        <ul className="flex flex-wrap gap-1">
          {filteredStillAvailable.map(c => (
            <CroppedChampionSquare
              key={c.key}
              version={staticData.version}
              championId={c.id}
              championName={c.name}
              as="li"
              className="h-12 w-12"
            />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold">Champions déjà joués :</h2>

        <ul className="flex flex-wrap gap-1">
          {filteredAlreadyPlayed.map(c => (
            <CroppedChampionSquare
              key={c.key}
              version={staticData.version}
              championId={c.id}
              championName={c.name}
              as="li"
              className="relative h-12 w-12"
            >
              <span className="absolute top-[calc(100%_-_2px)] w-20 origin-left -rotate-45 border-t-4 border-red-500 shadow-even shadow-black" />
            </CroppedChampionSquare>
          ))}
        </ul>
      </div>
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
