import { option, readonlyArray } from 'fp-ts'
import type { Option } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

export function cx(
  ...c: ReadonlyArray<Optional<string> | readonly [Optional<string>, boolean]>
): string | undefined {
  return pipe(
    c,
    readonlyArray.filterMap((arg): Option<string> => {
      if (arg === undefined) return option.none
      if (typeof arg === 'string') return option.some(arg)

      const [className, display] = arg
      return display && className !== undefined ? option.some(className) : option.none
    }),
    option.fromPredicate(readonlyArray.isNonEmpty),
    option.map(as => as.join(' ')),
    option.toUndefined,
  )
}
