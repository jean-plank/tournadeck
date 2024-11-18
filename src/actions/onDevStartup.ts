'use server'

import { adminPocketBase } from '../context/singletons/adminPocketBase'

export async function onDevStartup(): Promise<void> {
  await adminPocketBase()
}
