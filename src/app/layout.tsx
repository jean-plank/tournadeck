import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { onDevStartup } from '../actions/onDevStartup'
import { ContextMenuLayer } from '../components/floating/ContextMenu'
import { TooltipLayer } from '../components/floating/Tooltip'
import { PocketBaseContextProvider } from '../contexts/PocketBaseContext'
import type { ChildrenFC } from '../models/ChildrenFC'
import { cx } from '../utils/cx'
import './globals.css'

/**
 * For auth caching.
 *
 * Other calls should use `next: { revalidate: duration, tags: [tag] }`
 */
export const revalidate = 30 // seconds

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

const RootLayout: ChildrenFC = async ({ children }) => {
  if (process.env.NODE_ENV === 'development') {
    // import to trigger all effectful startup actions
    await onDevStartup()
  }

  return (
    <html lang="fr">
      <body
        className={cx(
          baloo2.variable,
          liberationMono.variable,
          friz.variable,
          'h-screen w-screen overflow-hidden font-baloo text-wheat',
        )}
      >
        <PocketBaseContextProvider>
          <div className="size-full overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900">
            {children}
          </div>
        </PocketBaseContextProvider>

        <ContextMenuLayer />

        <TooltipLayer />
      </body>
    </html>
  )
}

export default RootLayout
