import { either, json } from 'fp-ts'
import type { LazyArg } from 'fp-ts/function'
import { pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import { useCallback, useState } from 'react'

import { decodeError } from '../utils/ioTsUtils'

/**
 * @param initialState if not found in localStorage
 */
export function useLocalStorageState<O, A>(
  key: string,
  [codec, codecName]: Tuple<Codec<unknown, O, A>, string>,
  initialState: A | LazyArg<A>,
): Tuple<A, React.Dispatch<React.SetStateAction<A>>> {
  const [a, setA] = useState<A>(() => {
    const item = localStorage.getItem(key)

    if (item === null) return init(initialState)

    return pipe(
      json.parse(item),
      either.mapLeft(either.toError),
      either.chain(u => pipe(codec.decode(u), either.mapLeft(decodeError(codecName)(u)))),
      either.getOrElse(e => {
        console.warn('useLocalStorageState: error while reading from localStorage', e)
        return init(initialState)
      }),
    )
  })

  const setAWithLocalStorage: React.Dispatch<React.SetStateAction<A>> = useCallback(
    action =>
      setA(prev => {
        const res = isFunctionAction(action) ? action(prev) : action

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

const init = <A>(a: A | LazyArg<A>): A => (isFunctionInit(a) ? a() : a)
const isFunctionInit = <A>(a: A | LazyArg<A>): a is LazyArg<A> => typeof a === 'function'

const isFunctionAction = <A>(a: React.SetStateAction<A>): a is (prevState: A) => A =>
  typeof a === 'function'
