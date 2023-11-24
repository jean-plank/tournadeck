import { Effect, flow, pipe } from 'effect'
import { json as fpTsJson } from 'fp-ts'
import type { Encoder } from 'io-ts/Encoder'

import type { LoggerGetter, LoggerType } from '../LoggerGetter'
import type { Method } from '../models/Method'
import type { DecoderWithName } from '../models/ioTsModels'
import { EffecT, decodeEffecT } from '../utils/fp'
import { $text } from '../utils/macros'

type HttpOptions<O, A> = Omit<RequestInit, 'method'> & {
  /**
   * If defined, sets body to json[1] serialized with json[0] and set "Content-Type" header to "application/json"
   */
  json?: [Encoder<O, A>, A]
}

type MethodsHttpable = {
  [K in Method]: Httpable
}

type Httpable = <O, B>(url: string, options?: HttpOptions<O, B>) => TextOrJson

type TextOrJson = {
  text: EffecT<WithResponse<string>>
  json: {
    (): EffecT<WithResponse<unknown>>
    <A>(decoder: DecoderWithName<unknown, A>): EffecT<WithResponse<A>>
  }
}

type WithResponse<A> = {
  response: Response
  value: A
}

export class HttpClient implements MethodsHttpable {
  get: Httpable
  post: Httpable
  put: Httpable
  patch: Httpable
  head: Httpable
  delete: Httpable

  private logger: LoggerType

  constructor(Logger: LoggerGetter) {
    this.logger = Logger.named($text!(HttpClient))

    this.get = this.httpable('get')
    this.post = this.httpable('post')
    this.put = this.httpable('put')
    this.patch = this.httpable('patch')
    this.head = this.httpable('head')
    this.delete = this.httpable('delete')
  }

  http<O, B>(
    method: Method,
    url: string,
    { json, ...options }: HttpOptions<O, B> = {},
  ): EffecT<Response> {
    const encoded = json !== undefined ? encode(json) : undefined

    const headersEffect = Effect.sync((): Headers => {
      const headers: Headers =
        options.headers === undefined
          ? new Headers()
          : options.headers instanceof Headers
            ? options.headers
            : new Headers(options.headers)

      if (encoded !== undefined) {
        headers.set('Content-Type', 'application/json')
      }

      return headers
    })

    const effectBody: EffecT<string | RequestInit['body']> =
      encoded !== undefined
        ? EffecT.fromUnknownEither(fpTsJson.stringify(encoded))
        : Effect.succeed(options.body)

    return pipe(
      Effect.Do.pipe(
        Effect.bind('headers', () => headersEffect),
        Effect.bind('body', () => effectBody),
      ),
      Effect.flatMap(({ headers, body }) =>
        pipe(
          EffecT.tryPromise(() => fetch(url, { ...options, method, headers, body })),
          Effect.catchAll(e =>
            e instanceof TypeError ? Effect.fail(new HttpError(method, url)) : Effect.fail(e),
          ),
        ),
      ),
      EffecT.flatMapFirst(flow(formatResponse(method, url), this.logger.debug)),
      Effect.flatMap(res =>
        200 <= res.status && res.status < 300
          ? Effect.succeed(res)
          : Effect.fail(new HttpError(method, url, res)),
      ),
    )
  }

  private httpable(method: Method): Httpable {
    return (url, options): TextOrJson => {
      const res = this.http(method, url, options)

      return {
        text: pipe(
          res,
          Effect.flatMap(response =>
            pipe(
              EffecT.tryPromise(() => response.text()),
              Effect.map(value => ({ response, value })),
            ),
          ),
        ),
        json,
      }

      function json(): EffecT<WithResponse<unknown>>
      function json<A>(decoder: DecoderWithName<unknown, A>): EffecT<WithResponse<A>>
      function json<A>(decoder?: DecoderWithName<unknown, A>): EffecT<WithResponse<A>> {
        return pipe(
          res,
          Effect.flatMap(response =>
            pipe(
              EffecT.tryPromise<unknown>(() => response.json()),
              Effect.flatMap(i =>
                decoder === undefined ? Effect.succeed(i as A) : decodeEffecT(decoder)(i),
              ),
              Effect.map(value => ({ response, value })),
            ),
          ),
        )
      }
    }
  }
}

class HttpError extends Error {
  constructor(
    public method: Method,
    public url: string,
    public response?: Response,
  ) {
    super(`HttpError: ${method.toUpperCase()} ${url} - ${response?.status ?? '???'}`)
  }
}

function encode<O, A>([encoder, a]: [Encoder<O, A>, A]): O {
  return encoder.encode(a)
}

const formatResponse =
  (method: Method, url: string) =>
  (res: Response): string =>
    `${method.toUpperCase()} ${url} ${res.status}`
