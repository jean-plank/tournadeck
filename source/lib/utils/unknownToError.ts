import util from 'util'

export function unknownToError(e: unknown): Error {
  return e instanceof Error ? e : new UnknownError(util.inspect(e, { breakLength: Infinity }))
}

class UnknownError extends Error {}
