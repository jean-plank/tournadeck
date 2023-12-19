declare type NonEmptyArray<A> = readonly [A, ...A[]]

declare type ReadonlyRecord<K extends PropertyKey, A> = Readonly<Record<K, A>>

declare type SingleItemArray<A> = readonly [A] | readonly []

// overrides

declare module 'next/navigation' {
  import type { LinkProps } from 'next/link'
  import type { RedirectType } from 'next/navigation'

  function redirectFn<RouteInferType>(
    url: LinkProps<RouteInferType>['href'],
    type?: RedirectType,
  ): never

  export { redirectFn as redirect }
}
