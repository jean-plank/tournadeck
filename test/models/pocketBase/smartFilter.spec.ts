import { smartFilter } from '../../../src/models/pocketBase/smartFilter'
import { UserId } from '../../../src/models/pocketBase/tables/User'
import { expectT } from '../../expectT'

describe('smartFilter', () => {
  it('should empty', () => {
    expectT(smartFilter<'teams'>({})).toStrictEqual('')
  })

  it('should one', () => {
    const now = new Date()

    expectT(
      smartFilter<'tournaments'>({
        start: now,
      }),
    ).toStrictEqual('start = {:start}')
  })

  it('should multiple', () => {
    expectT(
      smartFilter<'attendees'>({
        role: 'top',
        isCaptain: true,
        comment: undefined,
        price: 0,
      }),
    ).toStrictEqual(
      'role = {:role} && isCaptain = {:isCaptain} && comment = {:comment} && price = {:price}',
    )
  })

  it('should id', () => {
    expectT(
      smartFilter<'users'>({
        id: UserId('123'),
        role: 'organiser',
      }),
    ).toStrictEqual('id = {:id} && role = {:role}')
  })
})
