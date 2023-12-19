import type { SWRResponse } from 'swr'

import { Loader } from './Loader'

type Props<A> = Pick<SWRResponse<A, unknown>, 'data' | 'error'> & {
  children: (data: A) => React.ReactElement | null
}

export function AsyncRenderer<A>({ data, error, children }: Props<A>): React.ReactElement | null {
  if (error !== undefined) {
    return (
      <div className="flex justify-center">
        {/* TODO: if 404, not found? */}
        <span className="mt-4 font-mono">error.</span>
      </div>
    )
  }

  if (data === undefined) {
    return (
      <div className="flex justify-center">
        <Loader className="mt-4 h-6" />
      </div>
    )
  }

  return children(data)
}
