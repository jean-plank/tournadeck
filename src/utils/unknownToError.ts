import 'server-cli-only'

import util from 'util'

export const unknownToError = (e: unknown): Error =>
  e instanceof Error ? e : new UnknownError(util.inspect(e, { breakLength: Infinity }))

class UnknownError extends Error {}
