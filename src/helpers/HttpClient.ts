import { either, json as fpTsJson, number, option, readonlyArray } from 'fp-ts'
import type { Either } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import type { Decoder } from 'io-ts/Decoder'
import type { Encoder } from 'io-ts/Encoder'
import type { Options as KyOptions, KyResponse } from 'ky'
import ky, { HTTPError as KyHTTPError } from 'ky'
import type { Except, Merge, OverrideProperties } from 'type-fest'

import type { GetLogger } from '../Logger'
import { immutableAssign } from '../utils/fpTsUtils'
import { decodeError } from '../utils/ioTsUtils'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete'

export type HttpOptions<O, B> = Merge<
  OverrideProperties<
    Except<KyOptions, 'method'>,
    {
      json?: Tuple<Encoder<O, B>, B>
    }
  >,
  {
    /**
     * @default false
     */
    silent?: boolean
  }
>

type HttpClient = ReturnType<typeof HttpClient>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const HttpClient = immutableAssign(
  (getLogger: GetLogger) => {
    const logger = getLogger('HttpClient')

    const methods: ReadonlyRecord<HttpMethod, ReturnType<typeof getHttp>> = {
      get: getHttp('get'),
      post: getHttp('post'),
      put: getHttp('put'),
      patch: getHttp('patch'),
      head: getHttp('head'),
      delete: getHttp('delete'),
    }

    return methods

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function getHttp(method: HttpMethod) {
      return immutableAssign(http, { text })

      function http<O, B>(
        url: string | URL | Request,
        options?: HttpOptions<O, B>,
      ): Promise<unknown>
      function http<A, O, B>(
        url: string | URL | Request,
        options: HttpOptions<O, B>,
        decoderWithName: Tuple<Decoder<unknown, A>, string>,
      ): Promise<A>
      async function http<A, O, B>(
        url: string | URL | Request,
        options?: HttpOptions<O, B>,
        decoderWithName?: Tuple<Decoder<unknown, A>, string>,
      ): Promise<A> {
        const body = await text(url, options)

        return pipe(
          fpTsJson.parse(body),
          either.flatMap(u => {
            if (decoderWithName === undefined) return either.right(u as A)

            const [decoder, decoderName] = decoderWithName

            return pipe(decoder.decode(u), either.mapLeft(decodeError(decoderName)(u)))
          }),
          either.getOrElseW(e => {
            throw e
          }),
        )
      }

      async function text<O, B>(
        url: string | URL | Request,
        options: HttpOptions<O, B> = {},
      ): Promise<string> {
        const json = ((): Optional<O> => {
          if (options.json === undefined) return undefined
          const [encoder, b] = options.json
          return encoder.encode(b)
        })()

        const result: Either<unknown, KyResponse> = await ky[method](url, {
          ...options,
          method,
          json: json === undefined ? undefined : json,
        })
          .then(either.right)
          .catch(either.left)

        if (options.silent !== true) {
          // Log status
          pipe(
            result,
            either.fold(
              e => (e instanceof KyHTTPError ? option.some(e.response.status) : option.none),
              res => option.some(res.status),
            ),
            option.fold(
              () => undefined,
              status => {
                logger.debug(
                  `${method.toUpperCase()} ${url instanceof Request ? url.url : url} - ${status}`,
                )
              },
            ),
          )
        }

        return pipe(
          result,
          either.fold(
            e => {
              throw e
            },
            res => res.text(),
          ),
        )
      }
    }
  },
  {
    statusesToUndefined:
      (...statuses: NonEmptyArray<number>) =>
      (e: unknown): undefined => {
        if (e instanceof KyHTTPError && readonlyArray.elem(number.Eq)(e.response.status, statuses))
          return undefined

        throw e
      },
  },
)

export { HttpClient }
