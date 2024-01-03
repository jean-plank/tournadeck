'use server'

import { adminPocketBase } from '../context/singletons/adminPocketBase'

export async function startupLoad(): Promise<void> {
  await adminPocketBase()
}
