import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import { loadDotenv } from './helpers/loadDotenv'
import { prompt } from './helpers/prompt'

loadDotenv()

async function dbClean(): Promise<void> {
  const prompted = await prompt('Cleaning all collections (including users), are your sure? [y/n] ')

  if (prompted === 'y') {
    console.info('Cleaning db')
  } else {
    console.info('Exiting without cleaning db')
    return
  }

  const { config } = await import('../config')

  const pb = MyPocketBase()

  await pb.admins.authWithPassword(config.ADMIN_PB_USERNAME, config.ADMIN_PB_PASSWORD)

  const collections = await pb.collections.getFullList({ cache: 'no-store' })

  await Promise.all(collections.map(c => pb.send(`/truncate/${c.name}`, { method: 'DELETE' })))
}

dbClean()
