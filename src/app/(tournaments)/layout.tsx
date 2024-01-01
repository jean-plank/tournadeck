import type { ChildrenFC } from '../../models/ChildrenFC'
import { TournamentContextProvider } from './TournamentContext'
import { TournamentHeader } from './TournamentHeader'

const TournamentLayout: ChildrenFC = async ({ children }) => (
  <TournamentContextProvider>
    <div className="grid h-full grid-rows-[auto_1fr]">
      <TournamentHeader />
      <main className="w-full overflow-auto">{children}</main>
    </div>
  </TournamentContextProvider>
)

export default TournamentLayout
