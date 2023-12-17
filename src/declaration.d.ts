declare type SingleItemArray<A> = readonly [A] | readonly []
declare type NonEmptyArray<A> = readonly [A, ...A[]]
