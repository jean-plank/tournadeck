import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { PocketBaseContextProvider } from '../contexts/PocketBaseContext'
import type { ChildrenFC } from '../models/ChildrenFC'
import { DayjsDuration } from '../models/Dayjs'
import { cx } from '../utils/cx'
import './globals.css'

/**
 * For auth caching.
 *
 * Other calls should use `next: { revalidate: duration, tags: [tag] }`
 */
export const revalidate = DayjsDuration({ seconds: 30 }).asSeconds()

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const friz = localFont({
  src: './fonts/Friz Quadrata Std Medium.otf',
  display: 'swap',
  variable: '--font-friz',
})

export const metadata: Metadata = {
  title: 'Tournadeck',
}

const RootLayout: ChildrenFC = ({ children }) => (
  <html lang="fr">
    <body
      className={cx(
        inter.variable,
        friz.variable,
        'h-screen w-screen bg-blue1 text-white font-inter',
      )}
    >
      <PocketBaseContextProvider>{children}</PocketBaseContextProvider>
    </body>
  </html>
)

export default RootLayout
