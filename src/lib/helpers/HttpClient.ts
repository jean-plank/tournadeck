import { Effect, flow, pipe } from 'effect'
import { json as fpTsJson } from 'fp-ts'
import type { Encoder } from 'io-ts/Encoder'

import type { MyLoggerGetter } from '../MyLogger'
import { Method } from '../models/Method'
import type { DecoderWithName } from '../models/ioTsModels'
import { brand } from '../utils/brand'
import { EffecT, decodeEffecT, recordEmpty } from '../utils/fp'
import { $text } from '../utils/macros'

type Tag = { readonly HttpClient: unique symbol }

type HttpClient = ReturnType<typeof HttpClient>

type ValidOForm = Record<string, string>

type HttpOptions<A, OJson, OForm extends ValidOForm> =
  | BaseOptions
  | (Omit<BaseOptions, 'body'> & {
      /**
       * If defined, sets body to json[1] serialized with json[0] and JSON.stringified
       * and sets "Content-Type" header to "application/json".
       */
      json: [Encoder<OJson, A>, A]
    })
  | (Omit<BaseOptions, 'body'> & {
      /**
       * If defined, sets body to form[1] serialized with form[0] and URLSearchParams
       * and sets "Content-Type" header to "application/x-www-form-urlencoded".
       */
      form: [Encoder<OForm, A>, A]
    })

type BaseOptions = Omit<RequestInit, 'method'>

type Httpable = <A, OJson, OForm extends ValidOForm>(
  url: string,
  options?: HttpOptions<A, OJson, OForm>,
) => TextOrJson

type TextOrJson = {
  text: EffecT<string>
  json: {
    (): EffecT<unknown>
    <A>(decoder: DecoderWithName<unknown, A>): EffecT<A>
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function HttpClient(Logger: MyLoggerGetter) {
  const logger = Logger($text!(HttpClient))

  const methods: ReadonlyRecord<Method, Httpable> = Method.values.reduce(
    (acc, method) => ({ ...acc, [method]: httpable(method) }),
    recordEmpty<Method, Httpable>(),
  )

  return brand<Tag>()({ ...methods, http })

  function http<A, OJson, OForm extends ValidOForm>(
    method: Method,
    url: string,
    options: HttpOptions<A, OJson, OForm> = {},
  ): EffecT<Response> {
    return pipe(
      headersAndBody(options),
      Effect.flatMap(({ headers, body }) =>
        pipe(
          EffecT.tryPromise(() => fetch(url, { ...options, method, headers, body })),
          Effect.catchAll(e =>
            e instanceof TypeError ? Effect.fail(new HttpError(method, url)) : Effect.fail(e),
          ),
        ),
      ),
      EffecT.flatMapFirst(flow(formatResponse(method, url), logger.debug)),
      Effect.flatMap(res =>
        200 <= res.status && res.status < 300
          ? Effect.succeed(res)
          : Effect.fail(new HttpError(method, url, res)),
      ),
    )
  }

  function httpable(method: Method): Httpable {
    return (url, options): TextOrJson => {
      const res = http(method, url, options)

      return {
        text: pipe(
          res,
          Effect.flatMap(response => EffecT.tryPromise(() => response.text())),
        ),
        json,
      }

      function json(): EffecT<unknown>
      function json<A>(decoder: DecoderWithName<unknown, A>): EffecT<A>
      function json<A>(decoder?: DecoderWithName<unknown, A>): EffecT<A> {
        return pipe(
          res,
          Effect.flatMap(response =>
            pipe(
              EffecT.tryPromise<unknown>(() => response.json()),
              Effect.flatMap(i =>
                decoder === undefined ? Effect.succeed(i as A) : decodeEffecT(decoder)(i),
              ),
            ),
          ),
        )
      }
    }
  }
}

export { HttpClient }

const contentTypeName = 'Content-Type'

function headersAndBody<A, OJson, OForm extends ValidOForm>(
  options: HttpOptions<A, OJson, OForm>,
): EffecT<{
  headers: Headers
  body: RequestInit['body']
}> {
  return pipe(
    contentTypeAndBody(options),
    Effect.map(({ contentType, body }) => {
      const headers: Headers =
        options.headers === undefined
          ? new Headers()
          : options.headers instanceof Headers
            ? options.headers
            : new Headers(options.headers)

      if (headers.get(contentTypeName) === null && contentType !== undefined) {
        headers.set(contentTypeName, contentType)
      }

      return { headers, body }
    }),
  )
}

function contentTypeAndBody<A, OJson, OForm extends ValidOForm>(
  options: HttpOptions<A, OJson, OForm>,
): EffecT<{
  contentType: Optional<string>
  body: RequestInit['body']
}> {
  if ('json' in options) {
    const [encoder, a] = options.json

    return pipe(
      encoder.encode(a),
      fpTsJson.stringify,
      EffecT.fromUnknownEither,
      Effect.map(body => ({ contentType: 'application/json', body })),
    )
  }

  if ('form' in options) {
    const [encoder, a] = options.form

    return pipe(
      EffecT.try(() => new URLSearchParams(encoder.encode(a))),
      Effect.map(body => ({
        contentType: 'application/x-www-form-urlencoded',
        body: body.toString(),
      })),
    )
  }

  return Effect.succeed({ contentType: undefined, body: options.body })
}

const formatResponse =
  (method: Method, url: string) =>
  (res: Response): string =>
    `${method.toUpperCase()} ${url} ${res.status}`

class HttpError extends Error {
  constructor(
    public method: Method,
    public url: string,
    public response?: Response,
  ) {
    super(`HttpError: ${method.toUpperCase()} ${url} - ${response?.status ?? '???'}`)
  }
}
