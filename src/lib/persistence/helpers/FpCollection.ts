import { Effect, pipe } from 'effect'
import type {
  CreateIndexesOptions,
  Filter,
  FindOptions,
  InsertOneOptions,
  InsertOneResult,
  Document as MongoDocument,
  IndexDescription as MongoIndexDescription,
  OptionalUnlessRequiredId,
} from 'mongodb'

import type { MyLogger } from '../../MyLogger'
import type { IndexDescription, WithoutProjection } from '../../models/MongoTypings'
import type { CodecWithName, DecoderWithName } from '../../models/ioTsModels'
import type { Branded } from '../../utils/brand'
import { brand } from '../../utils/brand'
import { EffecT, arrayMkString, arrayMutable, decodeEffecT } from '../../utils/fp'
import type { WithCollection } from './WithCollection'

type Tag = { readonly FpCollection: unique symbol }

type FpCollection<O extends MongoDocument, A> = Branded<
  Tag,
  {
    withCollection: WithCollection<O>
    ensureIndexes: (
      indexSpecs: NonEmptyArray<IndexDescription<A>>,
      options?: CreateIndexesOptions,
    ) => EffecT<void>
    insertOne: (doc: A, options?: InsertOneOptions) => EffecT<InsertOneResult<O>>
    findOne: {
      (filter: Filter<O>, options?: WithoutProjection<FindOptions<O>>): EffecT<Optional<A>>
      <B extends A>(
        filter: Filter<O>,
        options: WithoutProjection<FindOptions<O>>,
        decoder: DecoderWithName<unknown, B>,
      ): EffecT<Optional<B>>
    }
  }
>

function construct<O extends MongoDocument, A>(
  logger: MyLogger,
  codec: CodecWithName<unknown, OptionalUnlessRequiredId<O>, A>,
  withCollection: WithCollection<O>,
): FpCollection<O, A> {
  return brand<Tag>()({
    withCollection,

    ensureIndexes: (
      indexSpecs: NonEmptyArray<IndexDescription<A>>,
      options?: CreateIndexesOptions,
    ): EffecT<void> =>
      pipe(
        logger.info('Ensuring indexes'),
        Effect.flatMap(() =>
          withCollection.effect(c =>
            c.createIndexes(
              arrayMutable(indexSpecs as NonEmptyArray<MongoIndexDescription>),
              options,
            ),
          ),
        ),
      ),

    insertOne: (doc: A, options?: InsertOneOptions): EffecT<InsertOneResult<O>> => {
      const encoded = codec.encode(doc)
      return pipe(
        withCollection.effect(c => c.insertOne(encoded, options)),
        EffecT.flatMapFirst(() => logger.trace('Inserted', JSON.stringify(encoded))),
      )
    },

    findOne<B extends A>(
      filter: Filter<O>,
      options: WithoutProjection<FindOptions<O>> = {},
      decoder: DecoderWithName<unknown, B> = codec as DecoderWithName<unknown, B>,
    ): EffecT<Optional<B>> {
      return pipe(
        withCollection.effect(c => c.findOne(filter, options)),
        EffecT.flatMapFirst(res => logger.trace('Found one', JSON.stringify(res))),
        Effect.flatMap(res =>
          res === null ? Effect.succeed(undefined) : decodeEffecT(decoder)(res),
        ),
      )
    },
  })
}

function getPath<B>(): Path<B> {
  return (...path: ReadonlyArray<string>) => arrayMkString('.')(path)
}

const FpCollection = Object.assign(construct, { getPath })

export { FpCollection }

type KeyOf<A> = A extends ReadonlyArray<infer B>
  ? keyof B
  : A extends (infer C)[]
    ? keyof C
    : keyof A

type Path<S> = {
  <
    K1 extends KeyOf<S>,
    K2 extends KeyOf<S[K1]>,
    K3 extends KeyOf<S[K1][K2]>,
    K4 extends KeyOf<S[K1][K2][K3]>,
    K5 extends KeyOf<S[K1][K2][K3][K4]>,
  >(
    ...path: [K1, K2, K3, K4, K5]
  ): string
  <
    K1 extends KeyOf<S>,
    K2 extends KeyOf<S[K1]>,
    K3 extends KeyOf<S[K1][K2]>,
    K4 extends KeyOf<S[K1][K2][K3]>,
  >(
    ...path: [K1, K2, K3, K4]
  ): string
  <K1 extends KeyOf<S>, K2 extends KeyOf<S[K1]>, K3 extends KeyOf<S[K1][K2]>>(
    ...path: [K1, K2, K3]
  ): string
  <K1 extends KeyOf<S>, K2 extends KeyOf<S[K1]>>(...path: [K1, K2]): string
  <K1 extends KeyOf<S>>(...path: [K1]): string
}
