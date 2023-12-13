import type { HealthCheckPersistence } from '../persistence/HealthCheckPersistence'
import { brand } from '../utils/brand'
import type { EffecT } from '../utils/fp'

type Tag = { readonly HealthCheckService: unique symbol }

type HealthCheckService = ReturnType<typeof HealthCheckService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function HealthCheckService(healthCheckPersistence: HealthCheckPersistence) {
  const check: EffecT<boolean> = healthCheckPersistence.check

  return brand<Tag>()({
    check,
  })
}

export { HealthCheckService }
