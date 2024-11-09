import { readonlyArray } from 'fp-ts'

import { objectEntries } from './fpTsUtils'

export function cx(
  ...c: ReadonlyArray<Optional<string> | Tuple<Optional<string>, boolean> | Record<string, boolean>>
): Optional<string> {
  const classes = c.flatMap((arg): ReadonlyArray<string> => {
    if (arg === undefined) return []

    if (typeof arg === 'string') return [arg]

    if (isArray(arg)) {
      const [className, display] = arg

      if (className === undefined || !display) return []

      return [className]
    }

    return objectEntries(arg).flatMap(
      ([className, display]): SingleItemArray<string> => (display ? [className] : []),
    )
  })

  if (!readonlyArray.isNonEmpty(classes)) return undefined

  return classes.join(' ')
}

const isArray = Array.isArray as unknown as (
  c: Tuple<Optional<string>, boolean> | Record<string, boolean>,
) => c is Tuple<Optional<string>, boolean>
