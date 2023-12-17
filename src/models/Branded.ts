import { identity } from 'fp-ts/function'

export type Branded<Tag, A> = A & { _tag: Tag }

export function brand<Tag>(): <A>(a: A) => Branded<Tag, A> {
  return identity as <A>(a: A) => Branded<Tag, A>
}
