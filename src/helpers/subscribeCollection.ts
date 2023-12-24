import { either, json, predicate, readonlyArray, readonlyRecord, string } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase'

import type { Logger } from '../Logger'
import { DayjsDuration } from '../models/Dayjs'
import type { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { TableName, Tables } from '../models/pocketBase/Tables'
import type { PbOutput } from '../models/pocketBase/pbModels'
import { decodeErrorString, fromReadonlyArrayDecoder } from '../utils/ioTsUtils'
import { sleep } from '../utils/promiseUtils'

const retryDelay = DayjsDuration({ seconds: 1 })

export async function subscribeCollection<N extends TableName>(
  logger: Logger,
  pb: MyPocketBase,
  collection: N,
  topic: '*' | Tables[N]['id']['input'],
  onEvent: (e: RecordSubscription<PbOutput<Tables[N]>>) => void,
): Promise<UnsubscribeFunc> {
  const abortController = new AbortController()

  subscribeWithRetry()

  let clientId: string | undefined = undefined

  return async function unsubscribe(): Promise<void> {
    if (clientId !== undefined) {
      await postSubscription(pb, clientId, undefined)
    }
    abortController.abort()
  }

  async function subscribeWithRetry(): Promise<void> {
    try {
      await subscribe()
    } catch (e) {
      if (!(e instanceof TypeError && e.message === 'fetch failed')) {
        throw e
      }

      await sleep(retryDelay)

      subscribeWithRetry()
    }
  }

  async function subscribe(): Promise<void> {
    logger.debug(`Subscribing to PocketBase (${collection}/${topic})...`)

    const response = await fetch(pb.buildUrl('/api/realtime'), {
      cache: 'no-store',
      signal: abortController.signal,
    })

    if (!response.ok) {
      throw Error(`Fetch error: ${response.status}`)
    }

    if (response.body === null) {
      throw Error('Empty SSE')
    }

    pump(response.body.getReader())
  }

  async function pump(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    const { done, value } = await reader.read()

    if (value !== undefined) {
      const rawChunk = Buffer.from(value.buffer).toString()

      pipe(
        pbEventDecoder.decode(rawChunk),
        either.fold(
          e => {
            console.error(decodeErrorString('EventFromChunk')(rawChunk)(e))
          },
          event => {
            handleEvent(event)
          },
        ),
      )
    }

    if (done) {
      logger.warn(`Subscription to PocketBase broken (${collection}/${topic})`)

      reader.releaseLock()

      await sleep(retryDelay)

      subscribeWithRetry()
    } else {
      pump(reader)
    }
  }

  async function handleEvent(e: PbEvent): Promise<void> {
    if (e.event === 'PB_CONNECT') {
      clientId = e.id

      await postSubscription(pb, e.id, topic === '*' ? collection : `${collection}/${topic}`)

      logger.info(`Subscribed to PocketBase (${collection}/${topic})`)
    } else {
      onEvent(e.data as unknown as RecordSubscription<PbOutput<Tables[N]>>)
    }
  }
}

function postSubscription(
  pb: MyPocketBase,
  clientId: string,
  subscription: string | undefined,
): Promise<unknown> {
  return pb.send('/api/realtime', {
    method: 'POST',
    body: {
      clientId,
      subscriptions: subscription !== undefined ? [subscription] : [],
    },
    cache: 'no-store',
  })
}

const jsonDecoder = pipe(
  D.string,
  D.parse(str =>
    pipe(
      json.parse(str),
      either.fold(() => D.failure(str, 'Json'), D.success),
    ),
  ),
)

type PbEvent = D.TypeOf<typeof pbEventDecoder>

const lineRegex = /^([^:]+):(.+)$/

const pbEventDecoder = pipe(
  D.id<string>(),
  D.map(flow(string.split('\n'), readonlyArray.filter(predicate.not(string.isEmpty)))),
  D.compose(
    fromReadonlyArrayDecoder(
      pipe(
        D.id<string>(),
        D.parse(line => {
          const match = line.match(lineRegex)

          if (match === null) return D.failure(line, 'TupleFromLine')

          const [, key, val] = match

          return D.success([key, val] as const)
        }),
      ),
    ),
  ),
  D.map(readonlyRecord.fromEntries),
  D.compose(
    D.struct({
      id: D.string,
      event: D.string,
      data: jsonDecoder,
    }),
  ),
)
