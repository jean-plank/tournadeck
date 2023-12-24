import { createEnum } from '../../utils/createEnum'

type RiotTeamId = typeof RiotTeamId.T

const RiotTeamId = createEnum(100, 200)

export { RiotTeamId }
