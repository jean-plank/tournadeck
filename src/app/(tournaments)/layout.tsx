import { TournamentContextProvider } from '../../domain/(tournaments)/TournamentContext'
import { TournamentHeader } from '../../domain/(tournaments)/TournamentHeader'
import type { ChildrenFC } from '../../models/ChildrenFC'

const TournamentLayout: ChildrenFC = async ({ children }) => (
  <TournamentContextProvider>
    <div className="grid h-full grid-rows-[auto_1fr]">
      <TournamentHeader />
      <main className="w-full overflow-auto">{children}</main>
    </div>
  </TournamentContextProvider>
)

export default TournamentLayout
