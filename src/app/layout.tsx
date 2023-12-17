import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { PocketBaseContextProvider } from '../contexts/PocketBaseContext'
import { RootLoad } from '../domain/RootLoad'
import type { ChildrenFC } from '../models/ChildrenFC'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

const RootLayout: ChildrenFC = ({ children }) => (
  <html lang="en">
    <body className={inter.className}>
      <RootLoad load={load} />

      <PocketBaseContextProvider>{children}</PocketBaseContextProvider>
    </body>
  </html>
)

export default RootLayout

async function load(): Promise<void> {
  'use server'

  await import('../services/adminPocketBase')
}
