import { either, json, option, readonlyArray, readonlyRecord, string } from 'fp-ts'
import type { Option } from 'fp-ts/Option'
import { flow, pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase'

import type { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import type { TableName, Tables } from '../models/pocketBase/Tables'
import type { PbOutput } from '../models/pocketBase/pbModels'
import { decodeErrorString } from '../utils/ioTsUtils'

export async function subscribeCollection<N extends TableName>(
  pb: MyPocketBase,
  collection: N,
  topic: '*' | Tables[N]['id']['input'],
  onEvent: (e: RecordSubscription<PbOutput<Tables[N]>>) => void,
): Promise<UnsubscribeFunc> {
  const abortController = new AbortController()

  const response = await pb.send('/api/realtime', {
    cache: 'no-store',
    signal: abortController.signal,
  })

  if (response.body === null) {
    throw Error('Empty SSE')
  }

  const reader = response.body.getReader()

  new ReadableStream({
    start(controller) {
      return pump()

      async function pump(): Promise<void> {
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

        // When no more data needs to be consumed, close the stream
        if (done) {
          console.log('CLOSE')

          controller.close()
          reader.releaseLock()
          return
        }

        // Enqueue the next data chunk into our target stream
        controller.enqueue(value)
        return pump()
      }
    },
  })

  let clientId: string | undefined = undefined

  return async function unsubscribe(): Promise<void> {
    if (clientId !== undefined) {
      await postSubscription(pb, clientId, undefined)
    }
    abortController.abort()
  }

  async function handleEvent(e: PbEvent): Promise<void> {
    if (e.event === 'PB_CONNECT') {
      clientId = e.id

      await postSubscription(pb, e.id, topic === '*' ? collection : `${collection}/${topic}`)
    } else {
      onEvent(e.data as unknown as RecordSubscription<PbOutput<Tables[N]>>)
    }
  }
}

function postSubscription(
  pb: MyPocketBase,
  clientId: string,
  subscription: string | undefined,
): Promise<Response> {
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
  D.map(
    flow(
      string.split('\n'),
      readonlyArray.filterMap((line): Option<string | [string, string]> => {
        if (line === '') return option.none

        const match = line.match(lineRegex)

        if (match === null) return option.some(line)

        const [, key, val] = match

        return option.some([key, val] as const)
      }),
    ),
  ),
  D.compose(D.array(D.tuple(D.string, D.string))),
  D.map(readonlyRecord.fromEntries),
  D.compose(
    D.struct({
      id: D.string,
      event: D.string,
      data: jsonDecoder,
    }),
  ),
)
