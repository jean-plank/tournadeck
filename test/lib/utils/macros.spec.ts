import * as C from 'io-ts/Codec'

import { $decoderWithName, $withName } from '@/lib/utils/macros'

import { expectT } from '../../expectT'

const totoCodec = C.struct({
  foo: C.number,
  bar: C.boolean,
})

const Toto = { decoder: totoCodec }

describe('$withName', () => {
  it('should with totoCodec', () => {
    expectT($withName!(totoCodec)).toStrictEqual({
      ...totoCodec,
      name: 'totoCodec',
    })
  })

  it('should with C.array(totoCodec)', () => {
    const totoArrayCodec = C.array(totoCodec)

    expectT($withName!(C.array(totoCodec)).name).toStrictEqual('null')
    expectT($withName!(totoArrayCodec)).toStrictEqual({
      ...totoArrayCodec,
      name: 'totoArrayCodec',
    })
  })
})

describe('$decoderWithName', () => {
  it('should with Toto', () => {
    expectT($decoderWithName!(Toto)).toStrictEqual({
      ...totoCodec,
      name: 'Toto',
    })
  })
})
