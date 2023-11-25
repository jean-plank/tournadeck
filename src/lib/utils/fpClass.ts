type GetFpClass<Tag> = Tag extends never
  ? never
  : <
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      A extends (...args: ReadonlyArray<any>) => unknown,
      B extends ReadonlyRecord<PropertyKey, unknown>,
    >(
      construct: A,
      statik?: B,
    ) => ((..._: Parameters<A>) => ReturnType<A> & { _tag: Tag }) &
      B & { T: ReturnType<A> & { _tag: Tag } }

/**
 * `Tag` should be defined as `{ readonly MyClass: unique symbol }`
 * @param constructor The class constructor
 * @param static The class static methods (optional)
 */
export const fpClass = <Tag = never>(): GetFpClass<Tag> => Object.assign as GetFpClass<Tag>
