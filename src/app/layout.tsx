import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '@/app/globals.css'
import { ChildrenFC } from '@/app/models/ChildrenFC'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'tournadeck',
  description: 'WIP',
}

const RootLayout: ChildrenFC = ({ children }) => {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

export default RootLayout
