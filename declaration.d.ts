declare type Optional<A> = A | undefined

declare type NonEmptyArray<A> = readonly [A, ...A[]]

declare type ReadonlyRecord<K extends PropertyKey, A> = Readonly<Record<K, A>>
declare type PartialReadonlyRecord<K extends PropertyKey, A> = Partial<Readonly<Record<K, A>>>
