import type { Newtype } from 'newtype-ts'

declare global {
  declare type Optional<A> = A | undefined

  declare type NonEmptyArray<A> = ReadonlyArray<A> & {
    readonly 0: A
  }

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

declare module 'react' {
  export = React
  export as namespace React

  declare namespace React {
    type MyNewType<URI, A> = Newtype<URI, A>

    type MyKey = string | number | bigint | MyNewType<unknown, string | number | bigint>

    type MyReactNode =
      | MyNewType<unknown, string | number>
      | ReactElement
      | string
      | number
      | Iterable<ReactNode>
      | ReactPortal
      | boolean
      | null
      | undefined
      | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES]

    export { MyKey as Key, MyReactNode as ReactNode }
  }
}
