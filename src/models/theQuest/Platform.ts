import { createEnum } from '../../utils/createEnum'

type Platform = typeof Platform.T

const Platform = createEnum(
  'BR',
  'EUN',
  'EUW',
  'JP',
  'KR',
  'LA1',
  'LA2',
  'NA',
  'OC',
  'TR',
  'RU',
  'PH2',
  'SG2',
  'TH2',
  'TW2',
  'VN2',
)

export { Platform }
