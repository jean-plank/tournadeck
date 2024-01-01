import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { TooltipLayer } from '../components/tooltip/Tooltip'
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

const baloo2 = localFont({
  src: [
    {
      path: './fonts/baloo2/400-normal.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/baloo2/500-medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/baloo2/600-semibold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/baloo2/700-bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/baloo2/800-extrabold.ttf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-baloo2',
})

const liberationMono = localFont({
  src: [
    {
      path: './fonts/liberationMono/400-normal.ttf',
      weight: '400',
      style: 'normal',
    },

    {
      path: './fonts/liberationMono/700-bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-liberationMono',
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
        baloo2.variable,
        liberationMono.variable,
        friz.variable,
        'font-baloo text-wheat',
      )}
    >
      <PocketBaseContextProvider>
        <div className="h-screen w-screen bg-gradient-to-br from-slate-dark to-slate">
          {children}
        </div>
      </PocketBaseContextProvider>

      <TooltipLayer />
    </body>
  </html>
)

export default RootLayout
