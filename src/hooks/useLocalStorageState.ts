import { either, json } from 'fp-ts'
import type { LazyArg } from 'fp-ts/function'
import { pipe } from 'fp-ts/function'
import type { Codec } from 'io-ts/Codec'
import { useEffect, useState } from 'react'

import { decodeError } from '../utils/ioTsUtils'

/**
 * @param initialState if not found in localStorage
 */
export const useLocalStorageState = <O, A>(
  key: string,
  [codec, codecName]: Tuple<Codec<unknown, O, A>, string>,
  initialState: A | LazyArg<A>,
): Tuple<A, React.Dispatch<React.SetStateAction<A>>> => {
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

  useEffect(
    () =>
      pipe(
        codec.encode(a),
        json.stringify,
        either.mapLeft(either.toError),
        either.fold(
          e => console.warn('useLocalStorageState: error while writing to localStorage', e),
          str => localStorage.setItem(key, str),
        ),
      ),
    [a, codec, key],
  )

  return [a, setA]
}

const init = <A>(a: A | LazyArg<A>): A => (isFunction(a) ? a() : a)
const isFunction = <A>(a: A | LazyArg<A>): a is LazyArg<A> => typeof a === 'function'
