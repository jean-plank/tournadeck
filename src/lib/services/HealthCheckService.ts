import type { HealthCheckPersistence } from '../persistence/HealthCheckPersistence'
import type { EffecT } from '../utils/fp'

export class HealthCheckService {
  check: EffecT<boolean>

  constructor(healthCheckPersistence: HealthCheckPersistence) {
    this.check = healthCheckPersistence.check
  }
}
