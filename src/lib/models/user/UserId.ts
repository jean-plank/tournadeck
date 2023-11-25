import * as C from 'io-ts/Codec'
import type { Newtype } from 'newtype-ts'
import { iso } from 'newtype-ts'
import { v4 as uuidV4 } from 'uuid'

import { fromNewtype } from '../../utils/ioTsUtils'

type UserId = Newtype<{ readonly UserId: unique symbol }, string>

const { wrap } = iso<UserId>()

const codec = fromNewtype<UserId>(C.string)

function generate(): UserId {
  return wrap(uuidV4())
}

const UserId = { codec, generate }

export { UserId }
