'use client'

import { string } from 'fp-ts'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Tooltip } from '../../../../../components/floating/Tooltip'
import { CloseFilled, DiceFilled } from '../../../../../components/svgs/icons'
import { cx } from '../../../../../utils/cx'

type Props = {
  searchCount: number
  randomChampion: Optional<() => string>
  initialSearch: Optional<string>
  onChange: (search: Optional<string>) => void
  className?: string
}

export const SearchChampion: React.FC<Props> = ({
  searchCount,
  randomChampion,
  initialSearch,
  onChange,
  className,
}) => {
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyup = (e: KeyboardEvent): void => {
      if (
        ((e.key.toLowerCase() === 'f' && (e.ctrlKey || e.metaKey)) ||
          e.key === '/' ||
          e.key === 'F3') &&
        searchRef.current !== null
      ) {
        e.preventDefault()
        searchRef.current.select()
      }
    }

    document.addEventListener('keydown', onKeyup, true)
    return () => document.removeEventListener('keydown', onKeyup, true)
  }, [])

  const [search, setSearch] = useState(initialSearch ?? '')

  const emptySearch = useCallback(() => {
    setSearch('')
    searchRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearch('')
      searchRef.current?.blur()
    }
  }, [])

  const updateSearch = useCallback(
    (search_: string): void => {
      const trimed = search_.trim()

      onChange(string.isEmpty(trimed) ? undefined : trimed)
    },
    [onChange],
  )

  useEffect(() => {
    updateSearch(search)
  }, [updateSearch, search])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [],
  )

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => e.target.select(), [])

  const handleRandomClick = useMemo((): Optional<() => void> => {
    if (randomChampion === undefined) return undefined

    return () => setSearch(randomChampion())
  }, [randomChampion])

  const randomButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={cx('flex flex-wrap items-center gap-3', className)}>
      <div className="relative flex flex-col items-center text-xs">
        <div className="grid items-center">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            placeholder="Rechercher champion"
            className={cx(
              'w-[130px] justify-self-start rounded-sm border border-grey-disabled bg-transparent py-0.5 pl-2 area-1',
              search === '' ? 'pr-2' : 'pr-7',
            )}
          />
          {search !== '' ? (
            <button type="button" onClick={emptySearch} className="mr-1 justify-self-end area-1">
              <CloseFilled className="h-5 text-wheat" />
            </button>
          ) : null}
        </div>
        <span
          className={cx('absolute top-full pt-0.5 text-zinc-400', [
            'hidden',
            initialSearch === undefined,
          ])}
        >
          {searchCount} résultat{searchCount < 2 ? null : 's'}
        </span>
      </div>

      <button
        ref={randomButtonRef}
        type="button"
        onClick={handleRandomClick}
        disabled={randomChampion === undefined}
        className="group -mx-0.5 overflow-hidden p-0.5 disabled:opacity-30"
      >
        <DiceFilled className="h-7 transition-transform duration-300 group-enabled:group-hover:animate-dice" />
      </button>
      <Tooltip hoverRef={randomButtonRef} placement="top">
        Champion aléatoire
      </Tooltip>
    </div>
  )
}
