import { Header } from '../../domain/(tournaments)/Header'
import type { ChildrenFC } from '../../models/ChildrenFC'

const TournamentLayout: ChildrenFC = async ({ children }) => (
  <div className="grid grid-rows-[auto_1fr]">
    <Header />
    <main className="w-full overflow-auto">{children}</main>
  </div>
)

export default TournamentLayout
