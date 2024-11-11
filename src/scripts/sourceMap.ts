import { either, task } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import fs from 'fs/promises'
import * as D from 'io-ts/Decoder'
import path from 'path'
import { SourceMapConsumer } from 'source-map'

import { eitherGetOrThrow } from '../utils/fpTsUtils'
import { decodeError } from '../utils/ioTsUtils'

const argvDecoder = D.tuple(
  D.id<unknown>(),
  D.id<unknown>(),
  D.string, // url
  D.string, // output dir
)

async function sourceMap(): Promise<void> {
  const [, , url, outputDir] = pipe(
    argvDecoder.decode(process.argv),
    either.mapLeft(decodeError('Argv')(process.argv)),
    eitherGetOrThrow,
  )

  const rawSourceMap = await (await fetch(url)).text()

  const consumer = await new SourceMapConsumer(rawSourceMap)

  const sources = consumer.sources.filter(
    s => !s.startsWith('../../node_modules') && !s.startsWith('../webpack'),
  )

  console.log()
  console.log([`Writing files to directory ${JSON.stringify(outputDir)}:`, ...sources].join('\n- '))
  console.log()

  await task.sequenceSeqArray(
    sources.map(f => async () => {
      const file = path.join(outputDir, f)
      const dir = path.dirname(file)

      await fs.mkdir(dir, { recursive: true })

      const source = consumer.sourceContentFor(f)

      if (source === null) {
        throw Error(`Source ${f} was null`)
      }

      await fs.writeFile(file, source, 'utf-8')
    }),
  )()
}

sourceMap()
