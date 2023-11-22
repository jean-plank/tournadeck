declare type NonEmptyArray<A> = readonly [A, ...A[]]
declare type ReadonlyRecord<K extends PropertyKey, A> = Readonly<Record<K, A>>