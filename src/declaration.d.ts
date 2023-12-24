import type { Newtype } from 'newtype-ts'

declare global {
  declare type NonEmptyArray<A> = readonly [A, ...A[]]

  declare type ReadonlyRecord<K extends PropertyKey, A> = Readonly<Record<K, A>>

  declare type SingleItemArray<A> = readonly [A] | readonly []
}

// overrides

declare module 'newtype-ts' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, no-shadow, @typescript-eslint/no-unused-vars
  declare interface Newtype<URI, A> {
    toString: () => A
  }
}

declare module 'next/navigation' {
  import type { LinkProps } from 'next/link'
  import type { RedirectType } from 'next/navigation'

  function redirectFn<RouteInferType>(
    url: LinkProps<RouteInferType>['href'],
    type?: RedirectType,
  ): never

  export { redirectFn as redirect }
}

declare module 'react' {
  export = React
  export as namespace React

  declare namespace React {
    type MyKey = string | number | bigint | Newtype<unknown, string | number | bigint>

    export { MyKey as Key }
  }
}
