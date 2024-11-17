'use client'

type Props = {
  children?: React.ReactNode
}

export const ClientOnly: React.FC<Props> = ({ children }) => {
  if (typeof window === 'undefined') return null

  return children
}
