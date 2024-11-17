import { formatNumber } from '../../src/utils/stringUtils'
import { expectT } from '../expectT'

describe('stringUtils', () => {
  describe('formatNumber', () => {
    it('should format integer 0 digit', () => {
      expectT(formatNumber(123)).toStrictEqual('123')
    })

    it('should format integer 2 digits', () => {
      expectT(formatNumber(123, 2)).toStrictEqual('123,00')
    })

    it('should format double 0 digit', () => {
      expectT(formatNumber(0.123)).toStrictEqual('0')

      expectT(formatNumber(0.567)).toStrictEqual('1')
    })

    it('should format double 2 digits', () => {
      expectT(formatNumber(0.123, 2)).toStrictEqual('0,12')

      expectT(formatNumber(0.456, 2)).toStrictEqual('0,46')
    })
  })
})
