'use server'

import type { RedirectType } from 'next/navigation'
import { redirect } from 'next/navigation'

export async function redirectAction(url: string, type?: RedirectType): Promise<never> {
  redirect(url, type)
}
