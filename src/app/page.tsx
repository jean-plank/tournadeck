import { revalidateTag } from 'next/cache'

import { ClientButton } from '../components/ClientButton'
import { HomeClient } from '../domain/HomeClient'
import { createTest, listTest } from '../domain/test/actions'
import { UserId } from '../models/pocketBase/tables/User'

const Home: React.FC = async () => {
  const tests = await listTest()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <b>tests:</b>
        <ul>
          {tests.map(test => (
            <li key={test.id} className="list-item">
              {test.label}
            </li>
          ))}
        </ul>
        <br />

        <ClientButton type="button" onClick={addTest} className="border border-black">
          Add test
        </ClientButton>
      </div>

      <hr />

      <HomeClient key={UserId('')} />
    </div>
  )
}

export default Home

async function addTest(): Promise<void> {
  'use server'

  await createTest({ label: new Date().toISOString() })

  revalidateTag(listTest.tag)
}
