'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { ChildrenFC } from '../models/ChildrenFC'
import type { Tournament } from '../models/pocketBase/tables/Tournament'

type TournamentContext = {
  isLoading: boolean
  tournament: Optional<Tournament>
  setTournament: (tournament: Optional<Tournament>) => void
}

const TournamentContext = createContext<Optional<TournamentContext>>(undefined)

export const TournamentContextProvider: ChildrenFC = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)

  const [tournament, setTournament] = useState<Optional<Tournament>>(undefined)

  const value: TournamentContext = {
    isLoading,
    tournament,
    setTournament: useCallback((tournament_: Optional<Tournament>) => {
      setIsLoading(false)
      setTournament(tournament_)
    }, []),
  }

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
}

export function useTournament(): TournamentContext {
  const context = useContext(TournamentContext)
  if (context === undefined) {
    throw Error('useTournament must be used within a TournamentContextProvider')
  }
  return context
}

type SetTournamentProps = {
  tournament: Optional<Tournament>
}

export const SetTournament: React.FC<SetTournamentProps> = ({ tournament }) => {
  const { setTournament } = useTournament()

  useEffect(() => {
    setTournament(tournament)
  }, [setTournament, tournament])

  return null
}
