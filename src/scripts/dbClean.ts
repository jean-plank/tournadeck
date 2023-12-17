import fs from 'fs/promises'
import path from 'path'

import { MyPocketBase } from '../models/pocketBase/MyPocketBase'
import { loadDotenv } from './helpers/loadDotenv'
import { prompt } from './helpers/prompt'

loadDotenv()

const nextCache = path.resolve(__dirname, '..', '..', '.next', 'cache')

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

  const collections = await pb.collections.getFullList()

  await Promise.all(collections.map(c => pb.send(`/truncate/${c.name}`, { method: 'DELETE' })))

  const stat = await fs.stat(nextCache)

  if (stat.isDirectory()) {
    await fs.rm(nextCache, { recursive: true, force: true })
  }
}

dbClean()
