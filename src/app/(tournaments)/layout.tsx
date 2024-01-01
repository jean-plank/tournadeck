import type { ChildrenFC } from '../../models/ChildrenFC'
import { TournamentContextProvider } from './TournamentContext'
import { TournamentHeader } from './TournamentHeader'

const TournamentLayout: ChildrenFC = async ({ children }) => (
  <div className="grid h-full grid-rows-[auto_1fr]">
    <TournamentContextProvider>
      <TournamentHeader />
      <main className="w-full overflow-auto">{children}</main>
    </TournamentContextProvider>
  </div>
)

export default TournamentLayout
