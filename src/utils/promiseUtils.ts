import type { DayjsDuration } from '../models/Dayjs'

export function sleep(duration: DayjsDuration): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration.asMilliseconds()))
}
