import { TournamentContextProvider } from '../../contexts/TournamentContext'
import type { ChildrenFC } from '../../models/ChildrenFC'
import { TournamentHeader } from './TournamentHeader'

const TournamentLayout: ChildrenFC = ({ children }) => (
  <div className="grid h-full grid-rows-[auto_1fr]">
    <TournamentContextProvider>
      <TournamentHeader />
      <main className="w-full overflow-auto">{children}</main>
    </TournamentContextProvider>
  </div>
)

export default TournamentLayout
