import { either, json } from 'fp-ts'
import type { LazyArg } from 'fp-ts/function'
import { pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import { useCallback, useEffect, useState } from 'react'

import { decodeError } from '../utils/ioTsUtils'

/**
 * @param initialState if not found in localStorage
 */
export function useLocalStorageState<O, A>(
  key: string,
  [codec, codecName]: Tuple<Codec<unknown, O, A>, string>,
  initialState: A | LazyArg<A>,
): Tuple<A, React.Dispatch<React.SetStateAction<A>>> {
  const [a, setA] = useState<A>(initialState)

  useEffect(() => {
    const item = localStorage.getItem(key)

    if (item === null) return

    pipe(
      json.parse(item),
      either.mapLeft(either.toError),
      either.chain(u => pipe(codec.decode(u), either.mapLeft(decodeError(codecName)(u)))),
      either.fold(e => {
        console.warn('useLocalStorageState: error while reading from localStorage', e)
      }, setA),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setAWithLocalStorage: React.Dispatch<React.SetStateAction<A>> = useCallback(
    action =>
      setA(prev => {
        const res = isFunction(action) ? action(prev) : action

        pipe(
          codec.encode(res),
          json.stringify,
          either.mapLeft(either.toError),
          either.fold(
            e => console.warn('useLocalStorageState: error while writing to localStorage', e),
            str => localStorage.setItem(key, str),
          ),
        )

        return res
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return [a, setAWithLocalStorage]
}

const isFunction = <A>(a: React.SetStateAction<A>): a is (prevState: A) => A =>
  typeof a === 'function'
