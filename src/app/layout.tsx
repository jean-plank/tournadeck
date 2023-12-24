import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// import to trigger all effectful startup actions
import '../context'
import { PocketBaseContextProvider } from '../contexts/PocketBaseContext'
import { Header } from '../domain/Header'
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
      <PocketBaseContextProvider>
        <div className="grid h-screen w-screen grid-rows-[auto_1fr]">
          <Header />
          <main className="overflow-x-auto">{children}</main>
        </div>
      </PocketBaseContextProvider>
    </body>
  </html>
)

export default RootLayout
