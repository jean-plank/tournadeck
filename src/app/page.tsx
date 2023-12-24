import { HomeClient } from '../domain/HomeClient'
import { UserId } from '../models/pocketBase/tables/User'

const Home: React.FC = async () => (
  <div className="flex flex-col gap-4 p-4">
    <HomeClient key={UserId('')} />
  </div>
)

export default Home
