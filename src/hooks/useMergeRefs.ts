import { useCallback } from 'react'

export function useMergeRefs<A>(
  a: React.Ref<A>,
  ...as: NonEmptyArray<React.Ref<A>>
): (instance: A | null) => void {
  return useCallback(
    instance => {
      ;[a, ...as].forEach(ref => {
        if (typeof ref === 'function') {
          ref(instance)
        } else if (ref !== null) {
          ref.current = instance
        }
      })
    },
    [a, as],
  )
}
